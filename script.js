import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://vviuhvwxfaihpwnfdcgx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aXVodnd4ZmFpaHB3bmZkY2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTI5NjksImV4cCI6MjA5MjEyODk2OX0.PfBROkhmEfziSzUm4kfCknQPtSCPkDZ7s8Y48yC9xdU"
);

let chart;

async function loadData() {
  const { data } = await supabase.from("groups").select("*");

  console.log("Groups data:", data);

  const labels = data.map(g => "Group " + g.name);
  const values = data.map(g => g.balance);

  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Group Balance",
        data: values
      }]
    },
    options: {
      responsive: true
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