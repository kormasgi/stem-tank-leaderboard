import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://vviuhvwxfaihpwnfdcgx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aXVodnd4ZmFpaHB3bmZkY2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTI5NjksImV4cCI6MjA5MjEyODk2OX0.PfBROkhmEfziSzUm4kfCknQPtSCPkDZ7s8Y48yC9xdU"
);

let barChart;
let lineChart;

let leaderHistory = [];
let timeLabels = [];

async function loadData() {
  const { data } = await supabase.from("groups").select("*");

  data.sort((a, b) => b.balance - a.balance);

  const labels = data.map(g => "Group " + g.name);
  const values = data.map(g => g.balance);

  const firstPlace = data[0];

  const now = new Date().toLocaleTimeString();
  timeLabels.push(now);
  leaderHistory.push(firstPlace.balance);

  if (timeLabels.length > 10) {
    timeLabels.shift();
    leaderHistory.shift();
  }

  const colors = data.map((g, i) =>
    i === 0 ? "gold" : "rgba(54, 162, 235, 0.5)"
  );

  const barCtx = document.getElementById("barChart");

  if (barChart) barChart.destroy();

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Group Balance",
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const lineCtx = document.getElementById("lineChart");

  if (lineChart) lineChart.destroy();

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [{
        label: firstPlace.name + " (1st place)",
        data: leaderHistory,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

supabase
  .channel("groups")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "groups" },
    loadData
  )
  .subscribe();

loadData();