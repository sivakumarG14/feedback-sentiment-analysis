function checkExperience() {

    const value = document.getElementById("q1").value;
    const explainBox = document.getElementById("experienceExplain");

    if (value === "good" || value === "poor") {
        explainBox.style.display = "block";
    } else {
        explainBox.style.display = "none";
    }

}

async function submitFeedback() {

    const name = localStorage.getItem("studentName");

    if (!name) {
        alert("Session expired. Please login again.");
        window.location = "login.html";
        return;
    }

    const q1 = document.getElementById("q1").value;
    const q1Explain = document.getElementById("q1_explain").value;

    const q2 = document.getElementById("q2").value;
    const q3 = document.getElementById("q3").value;
    const q4 = document.getElementById("q4").value;
    const q5 = document.getElementById("q5").value;
    const q6 = document.getElementById("q6").value;
    const q7 = document.getElementById("q7").value;
    const q8 = document.getElementById("q8").value;
    const q9 = document.getElementById("q9").value;
    const q10 = document.getElementById("q10").value;

    const feedback = `
Overall experience: ${q1}
Explanation: ${q1Explain}
Teaching quality: ${q2}
Course content: ${q3}
Course difficulty: ${q4}
Learning materials: ${q5}
Student engagement: ${q6}
Liked most: ${q7}
Needs improvement: ${q8}
Suggestions: ${q9}
Additional comments: ${q10}
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

        const data = await res.json();

        resultBox.innerText = "Sentiment: " + data.sentiment;
        resultBox.style.color = "green";

    } catch (err) {

        resultBox.innerText = "Server Error";
        resultBox.style.color = "red";

    }

}
