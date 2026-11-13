// One-off generator: builds syllabus.json skeleton (grade > unit > subtopic) from the spec.
// Run once with `node scripts/gen-syllabus.mjs` to (re)produce frontend/src/data/syllabus.json.
// Flagship topics get hand-authored content merged in separately in content-overrides.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { overrides } from "./content-overrides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GRADES = [
  {
    grade: 6,
    units: [
      ["Area and Surface Area", ["Reasoning to Find Area", "Parallelograms", "Triangles", "Polygons", "Surface Area"]],
      ["Introducing Ratios", ["What Are Ratios", "Representing Equivalent Ratios", "Solving Ratio and Rate Problems"]],
      ["Unit Rates and Percentages", ["Units of Measurement", "Rates", "Percentages"]],
      ["Dividing Fractions", ["Making Sense of Division", "Meaning of Fraction Division", "Algorithm for Fraction Division", "Fractions in Lengths, Areas, and Volumes"]],
      ["Arithmetic in Base Ten", ["Warming Up to Decimals", "Multiplying Decimals", "Dividing Decimals"]],
      ["Expressions and Equations", ["Equations in One Variable", "Equal and Equivalent", "Expressions with Exponents", "Relationships Between Quantities"]],
      ["Rational Numbers", ["Negative Numbers and Absolute Value", "Inequalities", "The Coordinate Plane", "Common Factors and Common Multiples"]],
      ["Data Sets and Distributions", ["Data, Variability, and Statistical Questions", "Mean and MAD", "Median and IQR"]],
      ["Putting It All Together", ["Putting It All Together"]],
    ],
  },
  {
    grade: 7,
    units: [
      ["Scale Drawings", ["Scaled Copies", "Scale Drawings"]],
      ["Introducing Proportional Relationships", ["Representing Proportional Relationships with Tables", "Representing Proportional Relationships with Equations", "Representing Proportional Relationships with Graphs"]],
      ["Measuring Circles", ["Circumference of a Circle", "Area of a Circle"]],
      ["Proportional Relationships and Percentages", ["Proportional Relationships with Fractions", "Percent Increase and Decrease", "Applying Percentages"]],
      ["Rational Number Arithmetic", ["Adding and Subtracting Rational Numbers", "Multiplying and Dividing Rational Numbers", "Four Operations with Rational Numbers"]],
      ["Expressions, Equations, and Inequalities", ["Representing Situations of the Form px+q=r and p(x+q)=r", "Solving Equations of Those Forms and Problems That Lead to Them", "Inequalities", "Writing Equivalent Expressions"]],
      ["Angles, Triangles, and Prisms", ["Angle Relationships", "Drawing Polygons with Given Conditions", "Solid Geometry"]],
      ["Probability and Sampling", ["Probabilities of Single-Step Events", "Probabilities of Multi-Step Events", "Sampling", "Using Samples"]],
      ["Putting It All Together", ["Putting It All Together"]],
    ],
  },
  {
    grade: 8,
    units: [
      ["Rigid Transformations and Congruence", ["Rigid Transformations", "Properties of Rigid Transformations", "Congruence"]],
      ["Dilations, Similarity, and Introducing Slope", ["Dilations", "Similarity", "Slope"]],
      ["Linear Relationships", ["Proportional Relationships", "Representing Linear Relationships", "Finding Slopes"]],
      ["Linear Equations and Linear Systems", ["Puzzle Problems", "Systems of Linear Equations"]],
      ["Functions and Volume", ["Inputs and Outputs", "Linear Functions and Rates of Change", "Cylinders and Cones", "Dimensions and Spheres"]],
      ["Associations in Data", ["Does This Predict That?", "Associations in Categorical Data"]],
      ["Exponents and Scientific Notation", ["Exponent Review", "Scientific Notation"]],
      ["Pythagorean Theorem and Irrational Numbers", ["Side Lengths and Areas of Squares", "The Pythagorean Theorem", "Side Lengths and Volumes of Cubes"]],
      ["Putting It All Together", ["Putting It All Together"]],
    ],
  },
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const data = GRADES.map(({ grade, units }) => ({
  id: `g${grade}`,
  grade,
  title: `Grade ${grade}`,
  units: units.map(([unitTitle, subtopics], ui) => {
    const unitId = `g${grade}-u${ui + 1}`;
    return {
      id: unitId,
      title: `Unit ${ui + 1}: ${unitTitle}`,
      subtopics: subtopics.map((st) => {
        const id = `${unitId}-${slugify(st)}`;
        const override = overrides[id];
        return {
          id,
          title: st,
          videoUrl: "",
          generated: !!override,
          content: override || null,
        };
      }),
    };
  }),
}));

const outPath = path.join(__dirname, "..", "frontend", "src", "data", "syllabus.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
console.log("wrote", outPath);

let total = 0;
for (const g of data) for (const u of g.units) total += u.subtopics.length;
console.log("total subtopics:", total);
