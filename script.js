import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://vviuhvwxfaihpwnfdcgx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aXVodnd4ZmFpaHB3bmZkY2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTI5NjksImV4cCI6MjA5MjEyODk2OX0.PfBROkhmEfziSzUm4kfCknQPtSCPkDZ7s8Y48yC9xdU"
);

let barChart;

async function loadData() {
  const { data: groups, error } = await supabase
    .from("groups")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  groups.sort((a, b) => b.balance - a.balance);

  const labels = groups.map(g => g.name);
  const values = groups.map(g => g.balance);

  const colors = groups.map((g, i) =>
    i === 0 ? "gold" : "rgba(54, 162, 235, 0.5)"
  );

  const ctx = document.getElementById("barChart");

  if (barChart) barChart.destroy();

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "",
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // First place
  const first = groups[0];

  if (first) {
    document.getElementById("firstPlace").innerHTML =
      `First Place: <span style="color:gold;">${first.name}</span>`;
  }

  // Investments
  const { data: investments } = await supabase
    .from("investments")
    .select("amount");

  const totalCount = investments?.length || 0;

  let totalMoney = 0;
  investments?.forEach(i => totalMoney += i.amount);

  document.getElementById("investmentAmount").innerText =
    "Total Investments: " + totalCount;

  document.getElementById("totalMoney").innerText =
    "Total Money Invested: $" + totalMoney.toLocaleString();
}

// 🔥 REALTIME
supabase
  .channel("groups")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "groups" },
    (payload) => {
      console.log("Realtime update:", payload);
      setTimeout(loadData, 150); // small delay prevents glitches
    }
  )
  .subscribe();

loadData();