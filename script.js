let currentStep = 0;
const steps = document.getElementsByClassName("step");
const logoutBtn = document.getElementById("logoutBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");

//  Check Login
const studentName = localStorage.getItem("studentName");
if (!studentName) {
    alert("Please login first");
    window.location = "login.html";
}
document.getElementById("welcomeUser").innerText = "Welcome " + studentName;

//  Logout
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("studentName");
    window.location = "login.html";
});

//  Show Step
function showStep(n) {
    for (let i = 0; i < steps.length; i++) {
        steps[i].style.display = "none";
    }
    steps[n].style.display = "block";
    document.getElementById("submitBtn").style.display =
        (n === steps.length - 1) ? "inline-block" : "none";
    updateProgress();
    updateStepCounter();
}

//  Next
nextBtn.addEventListener("click", () => {
    const inputs = steps[currentStep].querySelectorAll("textarea, select");
    for (let input of inputs) {
        if (input.hasAttribute("required") && !input.value.trim()) {
            alert("Please answer this question before continuing.");
            return;
        }
    }

    // Special check for explanation
    const q1 = document.getElementById("q1").value;
    const q1Explain = document.getElementById("q1_explain");
    if ((q1 === "good" || q1 === "poor") && !q1Explain.value.trim()) {
        alert("Please explain your experience.");
        return;
    }
    if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
    }
});

//  Previous
prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
});

//  Progress Bar
function updateProgress() {
    const progress = (currentStep + 1) / steps.length * 100;
    document.getElementById("progressBar").style.width = progress + "%";
}

//  Step Counter
function updateStepCounter() {
    document.getElementById("stepCounter").innerText =
        `Step ${currentStep + 1} of ${steps.length}`;
}

//  Show explanation box
document.getElementById("q1").addEventListener("change", () => {
    const value = document.getElementById("q1").value;
    const explainBox = document.getElementById("experienceExplain");
    explainBox.style.display =
        (value === "good" || value === "poor") ? "block" : "none";
});

//  Submit
submitBtn.addEventListener("click", async () => {
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;
    const name = localStorage.getItem("studentName");
    const feedback = `
Overall experience: ${q1.value}
Explanation: ${q1_explain.value}
Teaching quality: ${q2.value}
Course content: ${q3.value}
Course difficulty: ${q4.value}
Learning materials: ${q5.value}
Student engagement: ${q6.value}
Liked most: ${q7.value}
Needs improvement: ${q8.value}
Suggestions: ${q9.value}
Additional comments: ${q10.value}
`;
    const resultBox = document.getElementById("result");
    try {
        const res = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                student_id: name,
                feedback
            })
        });
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        resultBox.innerText = "Sentiment: " + data.sentiment;
        if (data.sentiment === "Positive") {
            resultBox.style.color = "green";
        } else if (data.sentiment === "Negative") {
            resultBox.style.color = "red";
        } else {
            resultBox.style.color = "orange";
        }
    } catch (err) {
        resultBox.innerText = "Server Error";
        resultBox.style.color = "red";
    }
    submitBtn.innerText = "Submit";
    submitBtn.disabled = false;
});

//  Initialize
showStep(currentStep);
