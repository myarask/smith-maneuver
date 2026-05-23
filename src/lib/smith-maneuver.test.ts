import { describe, it, expect, vi } from "vitest";
import { getSimulationResults, type SimulationInputs } from "./smith-maneuver";

vi.mock("@/global/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/global/constants")>();
  return { ...actual, MONTHS_UNTIL_MAY: 12 };
});

const BASE: SimulationInputs = {
  homeValue: 700_000,
  mortgageBalance: 400_000,
  interestRate: 0.05,
  investmentReturn: 0.08,
  marginalTaxRate: 0.43,
  years: 10,
  readvancable: false,
};

// helocCap = min(0.8*700000 - 400000, 0.65*700000) = min(160000, 455000) = 160000
const HELOC_CAP = 160_000;

describe("getSimulationResults", () => {
  describe("snapshot count", () => {
    it("produces years*12 + 1 snapshots for a 10-year run", () => {
      const { snapshots } = getSimulationResults(BASE);
      expect(snapshots).toHaveLength(121);
    });

    it("produces years*12 + 1 snapshots for a 1-year run", () => {
      const { snapshots } = getSimulationResults({ ...BASE, years: 1 });
      expect(snapshots).toHaveLength(13);
    });

    it("snapshot month field matches its array index", () => {
      const { snapshots } = getSimulationResults(BASE);
      snapshots.forEach((s, i) => expect(s.month).toBe(i));
    });
  });

  describe("static fields", () => {
    it("homeValue is unchanged on every snapshot", () => {
      const { snapshots } = getSimulationResults(BASE);
      snapshots.forEach((s) => expect(s.homeValue).toBe(BASE.homeValue));
    });

    it("mortgageBalance is unchanged on every snapshot", () => {
      const { snapshots } = getSimulationResults(BASE);
      snapshots.forEach((s) =>
        expect(s.mortgageBalance).toBe(BASE.mortgageBalance),
      );
    });
  });

  describe("month-0 snapshot", () => {
    it("helocBalance equals the discounted initialDraw", () => {
      const { snapshots } = getSimulationResults(BASE);
      const expected =
        HELOC_CAP / Math.pow(1 + BASE.interestRate / 12, BASE.years * 12);
      expect(snapshots[0].helocBalance).toBeCloseTo(expected, 6);
    });

    it("marginBalance equals helocBalance at month 0", () => {
      const { snapshots } = getSimulationResults(BASE);
      expect(snapshots[0].marginBalance).toBe(snapshots[0].helocBalance);
    });

    it("cashPile is 0", () => {
      expect(getSimulationResults(BASE).snapshots[0].cashPile).toBe(0);
    });

    it("netEquity is 0", () => {
      expect(getSimulationResults(BASE).snapshots[0].netEquity).toBe(0);
    });

    it("cumulativeHelocRefund is 0", () => {
      expect(
        getSimulationResults(BASE).snapshots[0].cumulativeHelocRefund,
      ).toBe(0);
    });
  });

  describe("helocCap calculation", () => {
    it("is bounded by 0.8*hv - mb when mortgage is large", () => {
      // 0.8*700000 - 400000 = 160000 < 0.65*700000 = 455000
      const expected =
        HELOC_CAP / Math.pow(1 + BASE.interestRate / 12, BASE.years * 12);
      expect(getSimulationResults(BASE).snapshots[0].helocBalance).toBeCloseTo(
        expected,
        6,
      );
    });

    it("is bounded by 0.65*hv when mortgage is tiny", () => {
      // 0.8*700000 - 1 = 559999 > 0.65*700000 = 455000, cap = 455000
      const inputs = { ...BASE, mortgageBalance: 1, readvancable: true };
      const { snapshots } = getSimulationResults(inputs);
      expect(snapshots[0].helocBalance).toBeCloseTo(455_000, 4);
    });

    it("is 0 when mortgage exceeds 80% LTV", () => {
      // 0.8*500000 - 450000 = -50000 → clamped to 0
      const inputs = {
        ...BASE,
        homeValue: 500_000,
        mortgageBalance: 450_000,
      };
      const { snapshots } = getSimulationResults(inputs);
      snapshots.forEach((s) => {
        expect(s.helocBalance).toBe(0);
        expect(s.marginBalance).toBe(0);
      });
    });
  });

  describe("initial draw", () => {
    it("non-readvancable: helocBalance reaches helocCap after years*12 months", () => {
      const { snapshots } = getSimulationResults(BASE);
      expect(snapshots[120].helocBalance).toBeCloseTo(HELOC_CAP, 4);
    });

    it("readvancable: helocBalance starts at full helocCap", () => {
      const { snapshots } = getSimulationResults({
        ...BASE,
        readvancable: true,
      });
      expect(snapshots[0].helocBalance).toBeCloseTo(HELOC_CAP, 6);
    });
  });

  describe("HELOC balance compounding", () => {
    it("compounds at interestRate/12 each month", () => {
      const { snapshots } = getSimulationResults(BASE);
      const monthlyRate = BASE.interestRate / 12;
      for (let m = 1; m <= 5; m++) {
        expect(snapshots[m].helocBalance).toBeCloseTo(
          snapshots[m - 1].helocBalance * (1 + monthlyRate),
          6,
        );
      }
    });
  });

  describe("margin balance compounding", () => {
    it("compounds at investmentReturn/12 each month", () => {
      const { snapshots } = getSimulationResults(BASE);
      const monthlyReturn = BASE.investmentReturn / 12;
      for (let m = 1; m <= 5; m++) {
        expect(snapshots[m].marginBalance).toBeCloseTo(
          snapshots[m - 1].marginBalance * (1 + monthlyReturn),
          6,
        );
      }
    });
  });

  describe("tax refund timing (MONTHS_UNTIL_MAY=12 → fires at m=12,24,...)", () => {
    it("cashPile is 0 on months 1–11", () => {
      const { snapshots } = getSimulationResults(BASE);
      for (let m = 1; m <= 11; m++) {
        expect(snapshots[m].cashPile).toBe(0);
      }
    });

    it("cashPile increases at month 12", () => {
      const { snapshots } = getSimulationResults(BASE);
      expect(snapshots[12].cashPile).toBeGreaterThan(0);
    });

    it("cashPile is stable between annual payouts (months 13–23)", () => {
      const { snapshots } = getSimulationResults(BASE);
      for (let m = 13; m <= 23; m++) {
        expect(snapshots[m].cashPile).toBe(snapshots[12].cashPile);
      }
    });

    it("cashPile increases on exactly 10 months over a 10-year run", () => {
      const { snapshots } = getSimulationResults(BASE);
      let increases = 0;
      for (let m = 1; m < snapshots.length; m++) {
        if (snapshots[m].cashPile > snapshots[m - 1].cashPile) increases++;
      }
      expect(increases).toBe(10);
    });

    it("cashPile never decreases", () => {
      const { snapshots } = getSimulationResults(BASE);
      for (let m = 1; m < snapshots.length; m++) {
        expect(snapshots[m].cashPile).toBeGreaterThanOrEqual(
          snapshots[m - 1].cashPile,
        );
      }
    });
  });

  describe("cumulativeHelocRefund", () => {
    it("is monotonically non-decreasing", () => {
      const { snapshots } = getSimulationResults(BASE);
      for (let m = 1; m < snapshots.length; m++) {
        expect(snapshots[m].cumulativeHelocRefund).toBeGreaterThanOrEqual(
          snapshots[m - 1].cumulativeHelocRefund,
        );
      }
    });

    it("increments by helocInterest * marginalTaxRate each month", () => {
      const { snapshots } = getSimulationResults(BASE);
      const monthlyRate = BASE.interestRate / 12;
      for (let m = 1; m <= 5; m++) {
        const expectedIncrement =
          snapshots[m - 1].helocBalance * monthlyRate * BASE.marginalTaxRate;
        expect(
          snapshots[m].cumulativeHelocRefund -
            snapshots[m - 1].cumulativeHelocRefund,
        ).toBeCloseTo(expectedIncrement, 6);
      }
    });
  });

  describe("net equity", () => {
    it("equals marginBalance + cashPile - helocBalance on every snapshot", () => {
      const { snapshots } = getSimulationResults(BASE);
      snapshots.forEach((s) => {
        expect(s.netEquity).toBeCloseTo(
          s.marginBalance + s.cashPile - s.helocBalance,
          6,
        );
      });
    });

    it("is 0 at month 0", () => {
      expect(getSimulationResults(BASE).snapshots[0].netEquity).toBe(0);
    });

    it("is positive at month 120 when investmentReturn > interestRate", () => {
      expect(
        getSimulationResults(BASE).snapshots[120].netEquity,
      ).toBeGreaterThan(0);
    });
  });

  describe("zero marginal tax rate", () => {
    const inputs: SimulationInputs = { ...BASE, marginalTaxRate: 0 };

    it("cashPile is always 0", () => {
      const { snapshots } = getSimulationResults(inputs);
      snapshots.forEach((s) => expect(s.cashPile).toBe(0));
    });

    it("cumulativeHelocRefund is always 0", () => {
      const { snapshots } = getSimulationResults(inputs);
      snapshots.forEach((s) => expect(s.cumulativeHelocRefund).toBe(0));
    });

    it("HELOC still compounds normally", () => {
      const { snapshots } = getSimulationResults(inputs);
      const monthlyRate = inputs.interestRate / 12;
      expect(snapshots[1].helocBalance).toBeCloseTo(
        snapshots[0].helocBalance * (1 + monthlyRate),
        6,
      );
    });
  });

  describe("zero equity (helocCap = 0)", () => {
    const inputs: SimulationInputs = {
      ...BASE,
      homeValue: 500_000,
      mortgageBalance: 450_000,
    };

    it("helocBalance is 0 throughout", () => {
      const { snapshots } = getSimulationResults(inputs);
      snapshots.forEach((s) => expect(s.helocBalance).toBe(0));
    });

    it("marginBalance is 0 throughout", () => {
      const { snapshots } = getSimulationResults(inputs);
      snapshots.forEach((s) => expect(s.marginBalance).toBe(0));
    });

    it("netEquity is 0 throughout", () => {
      const { snapshots } = getSimulationResults(inputs);
      snapshots.forEach((s) => expect(s.netEquity).toBe(0));
    });

    it("still returns the correct number of snapshots", () => {
      const { snapshots } = getSimulationResults(inputs);
      expect(snapshots).toHaveLength(121);
    });
  });

  describe("readvancable vs non-readvancable", () => {
    it("readvancable starts with a larger helocBalance", () => {
      const standard = getSimulationResults(BASE);
      const readvancable = getSimulationResults({ ...BASE, readvancable: true });
      expect(readvancable.snapshots[0].helocBalance).toBeGreaterThan(
        standard.snapshots[0].helocBalance,
      );
    });

    it("readvancable has larger marginBalance at every month", () => {
      const standard = getSimulationResults(BASE);
      const readvancable = getSimulationResults({ ...BASE, readvancable: true });
      for (let m = 0; m <= 120; m++) {
        expect(readvancable.snapshots[m].marginBalance).toBeGreaterThan(
          standard.snapshots[m].marginBalance,
        );
      }
    });
  });

  describe("all values are finite", () => {
    it("no snapshot field is NaN or Infinity", () => {
      const { snapshots } = getSimulationResults(BASE);
      const fields = [
        "month",
        "homeValue",
        "mortgageBalance",
        "helocBalance",
        "marginBalance",
        "cashPile",
        "netEquity",
        "cumulativeHelocRefund",
      ] as const;
      snapshots.forEach((s) => {
        fields.forEach((f) => {
          expect(isFinite(s[f])).toBe(true);
        });
      });
    });
  });
});
