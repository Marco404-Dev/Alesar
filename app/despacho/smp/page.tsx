import OperationsBoard from "@/components/OperationsBoard";

export default function Page() {
  return <OperationsBoard site="smp" siteName="San Martín de Porres" mode="dispatch"
    testOrdersEnabled={process.env.NODE_ENV === "development" && process.env.ENABLE_TEST_ORDERS === "true"} />;
}
