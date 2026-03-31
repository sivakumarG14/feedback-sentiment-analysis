let pieChart;
let barChart;
let trendChart;

async function loadStats(){

try{

// FETCH STATS


const res = await fetch("http://127.0.0.1:5000/admin/stats");
const stats = await res.json();

document.getElementById("totalCount").innerText = stats.total_feedbacks;
document.getElementById("positiveCount").innerText = stats.positive;
document.getElementById("negativeCount").innerText = stats.negative;
document.getElementById("neutralCount").innerText = stats.neutral;


// PIE CHART

const pieCtx = document.getElementById("pieChart");

if(pieChart) pieChart.destroy();

pieChart = new Chart(pieCtx,{
type:"pie",
data:{
labels:["Positive","Negative","Neutral"],
datasets:[{
data:[
stats.positive,
stats.negative,
stats.neutral
],
backgroundColor:[
"#4CAF50",
"#f44336",
"#FFC107"
]
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
});


// BAR CHART

const barCtx = document.getElementById("barChart");

if(barChart) barChart.destroy();

barChart = new Chart(barCtx,{
type:"bar",
data:{
labels:["Positive","Negative","Neutral"],
datasets:[{
label:"Feedback Count",
data:[
stats.positive,
stats.negative,
stats.neutral
],
backgroundColor:[
"#4CAF50",
"#f44336",
"#FFC107"
]
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
scales:{
y:{beginAtZero:true}
}
}
});


// TOP NEGATIVE FEEDBACK

const negRes = await fetch("http://127.0.0.1:5000/admin/top-negative");
const negatives = await negRes.json();

const negList = document.getElementById("negativeList");
negList.innerHTML="";

negatives.forEach(item=>{
const li=document.createElement("li");
li.innerText=item.feedback;
negList.appendChild(li);
});


// COMMON TOPICS

const topicRes = await fetch("http://127.0.0.1:5000/admin/common-topics");
const topics = await topicRes.json();


// WORD CLOUD

const wordMap={};

const allWords=[
...topics.top_positive_topics,
...topics.top_negative_topics
];

allWords.forEach(word=>{
if(!wordMap[word]){
wordMap[word]=1;
}else{
wordMap[word]++;
}
});

const words=Object.entries(wordMap).map(([word,count])=>{
return[word,count*20];
});

WordCloud(document.getElementById("wordCloud"),{
list:words,
gridSize:12,
weightFactor:8,
backgroundColor:"#ffffff",
color:function(){
return"hsl("+Math.random()*360+",70%,50%)";
}
});


// NEGATIVE KEYWORDS

const negKey=document.getElementById("negativeKeywords");
negKey.innerHTML="";

topics.top_negative_topics.forEach(word=>{
const li=document.createElement("li");
li.innerText=word;
negKey.appendChild(li);
});


// POSITIVE KEYWORDS

const posKey=document.getElementById("positiveKeywords");
posKey.innerHTML="";

topics.top_positive_topics.forEach(word=>{
const li=document.createElement("li");
li.innerText=word;
posKey.appendChild(li);
});


// SENTIMENT TREND

const trendRes=await fetch("http://127.0.0.1:5000/admin/sentiment-trend");
const trend=await trendRes.json();

const trendCtx=document.getElementById("trendChart");

if(trendChart) trendChart.destroy();

trendChart=new Chart(trendCtx,{

type:"line",

data:{
labels:trend.dates,

datasets:[
{
label:"Positive",
data:trend.positive,
borderColor:"#4CAF50",
fill:false
},
{
label:"Negative",
data:trend.negative,
borderColor:"#f44336",
fill:false
},
{
label:"Neutral",
data:trend.neutral,
borderColor:"#FFC107",
fill:false
}
]
},

options:{
responsive:true,
maintainAspectRatio:false
}

});

}catch(error){

console.error("Dashboard error:",error);
alert("Error loading dashboard");

}

}

window.onload=()=>{
loadStats();
};

setInterval(loadStats,10000);
