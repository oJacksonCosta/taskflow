import { Metadata } from "next";

// Components
import Content from "./content";

export const metadata: Metadata = {
  title: "TaskFlow | Dashboard",
};

export default function Dashboard() {
  return <Content />;
}
