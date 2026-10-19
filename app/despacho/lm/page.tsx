import OperationsBoard from "@/components/OperationsBoard";

export default function Page() {
  return <OperationsBoard site="lm" siteName="La Molina" mode="dispatch"
    testOrdersEnabled={process.env.NODE_ENV === "development" && process.env.ENABLE_TEST_ORDERS === "true"} />;
}
