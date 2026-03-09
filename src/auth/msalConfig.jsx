import { PublicClientApplication } from "@azure/msal-browser";



export const msalConfig = {
	auth: {
		//clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
		//authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,

		clientId: "fed49076-dd22-4c92-9dc4-629f8cefb3ae",
		authority:
			"https://login.microsoftonline.com/57fdf63b-7e22-45a3-83dc-d37003163aae",
		redirectUri: "https://gxp-dev.onetakeda.com/gxp/ui/document-retrieval/implicit/callback";
	},
	cache: {
		cacheLocation: "localStorage",
		storeAuthStateInCookie: false,
	},
};

export const loginRequest = {
	// scopes: [import.meta.env.VITE_API_SCOPE],
	scopes: ["openid", "profile", "email", "User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
