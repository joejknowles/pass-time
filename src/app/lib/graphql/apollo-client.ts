import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { auth } from "@/lib/firebase";

if (process.env.NODE_ENV === "development") {
  loadDevMessages();
  loadErrorMessages();
}

const httpLink = new HttpLink({
  uri: "/api/graphql",
});

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const authLink = setContext(async (_, { headers }) => {
  const user = auth.currentUser;

  if (!user) {
    return { headers, "x-time-zone": timeZone };
  }

  try {
    const token = await user.getIdToken();
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
        "x-time-zone": timeZone,
      },
    };
  } catch (error) {
    console.error("Error retrieving Firebase token:", error);
    return { headers };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
