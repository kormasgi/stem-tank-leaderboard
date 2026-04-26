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

  const { data: groups } = await supabase.from("groups").select("*");

  groups.sort((a, b) => b.balance - a.balance);

  const labels = groups.map(g => "Group " + g.name);
  const values = groups.map(g => g.balance);

  const colors = groups.map((g, i) =>
    i === 0 ? "gold" : "rgba(54, 162, 235, 0.5)"
  );

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .gte("created_at", oneWeekAgo.toISOString())
    .order("created_at", { ascending: true });

  let totals = {};

  let timeLabels = [];
  let leaderHistory = [];
  let leaderNames = [];

  investments.forEach(inv => {
    if (!totals[inv.group_name]) {
      totals[inv.group_name] = 0;
    }

    totals[inv.group_name] += inv.amount;

    let leader = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];

    timeLabels.push(new Date(inv.created_at).toLocaleTimeString());
    leaderHistory.push(leader[1]);
    leaderNames.push(leader[0]);
  });

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
        label: "1st Place Over Time",
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