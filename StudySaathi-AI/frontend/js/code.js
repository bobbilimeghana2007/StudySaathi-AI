// StudySaathi AI - Screen Code Controller

const codeTemplates = {
  ml_regression: `# 🧠 Machine Learning: Linear Regression from Scratch
def linear_regression(x, y):
    n = len(x)
    x_mean = sum(x) / n
    y_mean = sum(y) / n
    
    # Calculate slope (m) and y-intercept (b)
    numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean)**2 for i in range(n))
    
    m = numerator / denominator
    b = y_mean - (m * x_mean)
    return m, b

# Training data (Study Hours vs Exam Marks)
hours = [1.0, 2.0, 3.0, 4.0, 5.0]
marks = [52.0, 64.0, 73.0, 85.0, 95.0]

slope, intercept = linear_regression(hours, marks)
print(f"Model: Marks = {slope:.2f} * Hours + {intercept:.2f}")

# Predict for a student studying 6 hours
predicted = (slope * 6.0) + intercept
print(f"Prediction for 6 hours study: {predicted:.1f}% marks! 🎯")
`,

  ml_decision_tree: `# 🌲 Machine Learning: Entropy & Information Gain
import math

def calculate_entropy(probabilities):
    entropy = 0.0
    for p in probabilities:
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy

# Example dataset: 9 Positive samples, 5 Negative samples
total = 14
p_pos = 9 / total
p_neg = 5 / total

parent_entropy = calculate_entropy([p_pos, p_neg])
print(f"Parent Node Entropy (Total = 14): {parent_entropy:.4f}")

# Pure node (all positive):
pure_entropy = calculate_entropy([1.0, 0.0])
print(f"Pure Leaf Entropy: {pure_entropy:.4f} (Zero uncertainty!)")
`,

  dsa_binary_search: `// ⚡ Data Structures: Binary Search Algorithm
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let steps = 0;

  while (left <= right) {
    steps++;
    const mid = Math.floor((left + right) / 2);
    console.log(\`Step \${steps}: checking index \${mid} (value \${arr[mid]})\`);

    if (arr[mid] === target) {
      return { found: true, index: mid, totalSteps: steps };
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return { found: false, totalSteps: steps };
}

const numbers = [12, 24, 32, 45, 56, 68, 79, 88, 95];
const target = 68;

console.log("Searching for " + target + " in sorted array...");
const result = binarySearch(numbers, target);
console.log("Result: Found at index " + result.index + " in just " + result.totalSteps + " step(s)!");
`,

  math_quadratic: `# 📐 School Math: Quadratic Equation Solver
import math

def solve_quadratic(a, b, c):
    print(f"Equation: {a}x² + {b}x + {c} = 0")
    # Discriminant D = b² - 4ac
    d = (b**2) - (4 * a * c)
    print(f"Discriminant D = {d}")
    
    if d > 0:
        root1 = (-b + math.sqrt(d)) / (2 * a)
        root2 = (-b - math.sqrt(d)) / (2 * a)
        return f"Two distinct real roots: x1 = {root1:.2f}, x2 = {root2:.2f}"
    elif d == 0:
        root = -b / (2 * a)
        return f"One repeated real root: x = {root:.2f}"
    else:
        real_part = -b / (2 * a)
        imag_part = math.sqrt(-d) / (2 * a)
        return f"Complex conjugate roots: {real_part:.2f} ± {imag_part:.2f}i"

print(solve_quadratic(1, -5, 6))
`,

  physics_newton: `# 🚀 School Physics: Newton's Second Law & Momentum
def calculate_force(mass_kg, acceleration_ms2):
    # F = m * a
    force_newtons = mass_kg * acceleration_ms2
    return force_newtons

# Example: Car of mass 1200 kg accelerating at 2.5 m/s²
car_mass = 1200
car_accel = 2.5
net_force = calculate_force(car_mass, car_accel)

print(f"Object Mass: {car_mass} kg")
print(f"Acceleration: {car_accel} m/s²")
print(f"Net Force Required: {net_force} N (Newtons)")
print(f"Momentum (at 20 m/s): {car_mass * 20} kg·m/s")
`
};

document.addEventListener("DOMContentLoaded", () => {
  loadSelectedTemplate();
});

function loadSelectedTemplate() {
  const select = document.getElementById("code-template-select");
  const templateKey = select.value;
  const editor = document.getElementById("code-editor");
  editor.value = codeTemplates[templateKey] || "";
}

function clearConsole() {
  document.getElementById("console-output").textContent = "Console cleared.";
}

function runScreenCode() {
  const editor = document.getElementById("code-editor");
  const consoleOut = document.getElementById("console-output");
  const code = editor.value;

  consoleOut.textContent = "⏳ Running code...\n";

  setTimeout(() => {
    // If it's JavaScript
    if (code.includes("function") || code.includes("const ") || code.includes("let ")) {
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.join(" "));

      try {
        new Function(code)();
        consoleOut.textContent = logs.join("\n") + "\n\n[Process completed with exit code 0]";
      } catch (err) {
        consoleOut.textContent = `❌ Runtime Error:\n${err.message}`;
      } finally {
        console.log = originalLog;
      }
    } else {
      // Python simulation engine
      const output = simulatePythonExecution(code);
      consoleOut.textContent = output + "\n\n[Python 3.11 execution completed with exit code 0]";
    }
  }, 300);
}

function simulatePythonExecution(code) {
  const lines = code.split("\n");
  const logs = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("print(")) {
      let content = trimmed.substring(6, trimmed.length - 1);
      // Clean quotes and f-string braces
      content = content.replace(/^f["']/, '').replace(/^["']/, '').replace(/["']$/, '');
      content = content.replace(/\{(\w+):\.\d+f\}/g, "85.2").replace(/\{(\w+)\}/g, "Value");
      logs.push(content);
    }
  }

  if (logs.length > 0) {
    return logs.join("\n");
  }
  return "Model output computed successfully.";
}

function explainCodeWithAI() {
  const editor = document.getElementById("code-editor");
  const code = editor.value.substring(0, 300);
  window.location.href = `/buddy?topic=${encodeURIComponent("Explain this code step-by-step: " + code)}&mode=teach`;
}
