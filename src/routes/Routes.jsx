import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { RouteKeys } from "./route-keys.jsx";

const Login = lazy(() => import("../views/Login"));
const WelcomePage = lazy(() => import("../views/Welcome"));
const Home = lazy(() => import("../views/Home"));
const MirAIChat = lazy(() => import("../views/MirAIChat"));
const DocumentGenerator = lazy(() => import("../views/DocumentGenerator"));
const AnalystAgent = lazy(() => import("../views/AnalystAgent"));

export default function NavRoute() {
	return (
		<Suspense
			fallback={<div style={{ padding: "20px", textAlign: "center" }}></div>}>
			<Routes>
				<Route path={RouteKeys.Login} element={<Login />} />

				{/*<Route
          path={RouteKeys.WelcomePage}
          element={<WelcomePage/>}
        />

        <Route
          path={RouteKeys.Home}
          element={<Home/>}
        />*/}

				<Route path={RouteKeys.MirAIChat} element={<MirAIChat />} />
				<Route
					path={RouteKeys.GenerateDocument}
					element={<DocumentGenerator />}
				/>

				{/*<Route
          path={RouteKeys.AnalystAgent}
          element={<AnalystAgent/>}
        />*/}
			</Routes>
		</Suspense>
	);
}
