const fetch = require("node-fetch"); // Ensure you have node-fetch installed (for Node.js)

const session_id = "your-session-id"; // Replace with your session ID

const https = require("https");
const agent = new https.Agent({ keepAlive: true });

// Retrieve route data
async function getRoutes(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session_id}`,
      },
      agent,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch routes: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Filter accessible routes
function filterAccessibleRoutes(routes) {
  return routes.filter((route) => route.accessible);
}

// Helper function for Bubble Sort
function bubbleSort(routes) {
  const n = routes.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (routes[j].distance > routes[j + 1].distance) {
        // Swap routes[j] and routes[j+1]
        [routes[j], routes[j + 1]] = [routes[j + 1], routes[j]];
      }
    }
  }
  return routes;
}

// Submit sorted routes
async function submitRoutes(url, sortedRoutes) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session_id}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ routes: sortedRoutes }),
    });
    const data = await response.json();
    console.log("Submission Response:", data);
    return data;
  } catch (error) {
    console.error("Error submitting routes:", error);
  }
}

// Check progress
async function checkProgress() {
  try {
    const response = await fetch(
      "https://hackdiversity.xyz/api/navigation/status",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session_id}`,
        },
      }
    );
    const data = await response.json();
    console.log("Progress:", data);
  } catch (error) {
    console.error("Error checking progress:", error);
  }
}

// Main function
async function main() {
  // Step 1: Retrieve routes
  const routes = await getRoutes(
    "https://hackdiversity.xyz/api/navigation/routes"
  );
  if (!routes) return;

  // Step 2: Filter and sort routes
  const accessibleRoutes = filterAccessibleRoutes(routes);
  const sortedRoutes = bubbleSort(accessibleRoutes);

  // Step 3: Test with mock data
  const mockRoutes = await getRoutes(
    "https://hackdiversity.xyz/api/test/mockRoutes"
  );
  if (mockRoutes) {
    const mockAccessibleRoutes = filterAccessibleRoutes(mockRoutes);
    const mockSortedRoutes = bubbleSort(mockAccessibleRoutes);
    await submitRoutes(
      "https://hackdiversity.xyz/api/test/submit-sorted-routes",
      mockSortedRoutes
    );
  }

  // Step 4: Submit final sorted routes
  await submitRoutes(
    "https://hackdiversity.xyz/api/navigation/sorted_routes",
    sortedRoutes
  );

  // Step 5: Check progress
  await checkProgress();
}

main();
