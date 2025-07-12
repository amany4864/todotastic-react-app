import axios from "axios";

export async function getAIPlan(prompt: string): Promise<string> {
  const res = await axios.post("/plan", { prompt });
  return res.data.plan;
}
