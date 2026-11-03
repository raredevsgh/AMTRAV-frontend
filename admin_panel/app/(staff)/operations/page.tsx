import {Suspense} from "react";
import {Operations} from "@/features/operations";
import {LoadingState} from "@/components/console-ui";
export const metadata={title:"Device Operations"};
export default function OperationsPage() {return <Suspense fallback={<LoadingState label="Loading device operations" />}><Operations /></Suspense>;}
