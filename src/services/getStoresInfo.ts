"use server";
import axios from "axios";

// Use Docker service name when running in Docker, localhost for local development
// In Docker, use the service name; locally use localhost
const API_BASE_URL = process.env.API_URL || "http://stock-scraper:5000";

export async function getStores(target: string, area: string) {
  try {
    const stores = await axios.get(`${API_BASE_URL}/api/bolaget/getstores`, {
      params: {
        target: target,
        area: area,
      },
    });
    return stores.data;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
}
