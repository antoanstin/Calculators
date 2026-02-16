export type StateCode =
    | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL"
    | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME"
    | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH"
    | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI"
    | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";

export interface LoanLimit {
    oneUnit: number;
    twoUnit: number;
    threeUnit: number;
    fourUnit: number;
}

export const LOAN_LIMITS_2025: Record<string, Record<StateCode, LoanLimit>> = {
    fannie: {
        "AL": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "AK": { oneUnit: 1209750, twoUnit: 1548750, threeUnit: 1872100, fourUnit: 2326500 }, // High cost area
        "AZ": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "AR": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "CA": { oneUnit: 1209750, twoUnit: 1548750, threeUnit: 1872100, fourUnit: 2326500 }, // High cost
        "CO": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 }, // Denver higher but using floor for simplicity if no county data
        "CT": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "DE": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "DC": { oneUnit: 1209750, twoUnit: 1548750, threeUnit: 1872100, fourUnit: 2326500 },
        "FL": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "GA": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "HI": { oneUnit: 1209750, twoUnit: 1548750, threeUnit: 1872100, fourUnit: 2326500 },
        "ID": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "IL": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "IN": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "IA": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "KS": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "KY": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "LA": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "ME": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "MD": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "MA": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "MI": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "MN": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "MS": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "MO": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "MT": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "NE": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "NV": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "NH": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "NJ": { oneUnit: 1209750, twoUnit: 1548750, threeUnit: 1872100, fourUnit: 2326500 }, // High Cost
        "NM": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "NY": { oneUnit: 1209750, twoUnit: 1548750, threeUnit: 1872100, fourUnit: 2326500 }, // High Cost
        "NC": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "ND": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "OH": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "OK": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "OR": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "PA": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "RI": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "SC": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "SD": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "TN": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "TX": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "UT": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "VT": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "VA": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "WA": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "WV": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "WI": { oneUnit: 806500, twoUnit: 1032500, threeUnit: 1248050, fourUnit: 1551000 },
        "WY": { oneUnit: 1209750, twoUnit: 1548750, threeUnit: 1872100, fourUnit: 2326500 }, // High Cost Teton
    },
    fha: {
        "AL": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "AK": { oneUnit: 747385, twoUnit: 956925, threeUnit: 1156688, fourUnit: 1437525 },
        "AZ": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "AR": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "CA": { oneUnit: 1149825, twoUnit: 1472250, threeUnit: 1779525, fourUnit: 2211600 },
        "CO": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "CT": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "DE": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "DC": { oneUnit: 1149825, twoUnit: 1472250, threeUnit: 1779525, fourUnit: 2211600 },
        "FL": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "GA": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "HI": { oneUnit: 747385, twoUnit: 956925, threeUnit: 1156688, fourUnit: 1437525 },
        "ID": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "IL": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "IN": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "IA": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "KS": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "KY": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "LA": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "ME": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "MD": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "MA": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "MI": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "MN": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "MS": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "MO": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "MT": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "NE": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "NV": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "NH": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "NJ": { oneUnit: 1149825, twoUnit: 1472250, threeUnit: 1779525, fourUnit: 2211600 },
        "NM": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "NY": { oneUnit: 1149825, twoUnit: 1472250, threeUnit: 1779525, fourUnit: 2211600 },
        "NC": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "ND": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "OH": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "OK": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "OR": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "PA": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "RI": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "SC": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "SD": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "TN": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "TX": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "UT": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "VT": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "VA": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "WA": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "WV": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "WI": { oneUnit: 498257, twoUnit: 637950, threeUnit: 771125, fourUnit: 958350 },
        "WY": { oneUnit: 747385, twoUnit: 956925, threeUnit: 1156688, fourUnit: 1437525 },
    }
};
