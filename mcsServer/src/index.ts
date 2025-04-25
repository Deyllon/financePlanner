import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";


const FINANCE_BASE = "http://localhost:3000";
const USER_AGENT = "finance-planner/1.0";

// Create server instance
const server = new McpServer({
  name: "financePlanner",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for making NWS API requests
  
  interface OperationsResponse {
    metadata: Object,
    data: {
        id: number,
        type: string,
        value: number,
        date: string,
        user_id: number,
        category: string,
        operationId: string
    }[]
  }

  interface UsersResponse {
    metadata: Object,
    data: {
        id: number,
        name: string,
        email: string,
        password: string,
        profile: string,
        active: boolean
    }[]
  }

  interface GoalsResponse {
    metadata: Object,
    data: {
        id: number,
        name: string,
        user_id: number,
        deadline: string,
        value: number,
    }[]
  }
  

server.tool(
    "get-operations",
    "Get all operations until user's request is satisfied",
    async () => {
    
      const financePlannerUrlToken = `${FINANCE_BASE}/auth/login`;
      const financePlannerUrlOperations = `${FINANCE_BASE}/operations`;
      const loginResponse = await fetch(financePlannerUrlToken, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "seuEmail",
          password: "suaSenha",
        }),
      });
      
      const tokenData = await loginResponse.json();
      const accessToken = tokenData.data?.access_token;
      
      if (!accessToken) {
        throw new Error("Authentication failed: No access token returned.");
      }

      let currentPage = 1;
      const limit = 10;
      let allOperations: OperationsResponse["data"] = [];
      
      while (true) {
        const paginatedUrl = `${financePlannerUrlOperations}?page=${currentPage}&limit=${limit}`;
      
        const response = await fetch(paginatedUrl, {
          method: "GET",
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });
      
        const pageData: OperationsResponse = await response.json();
      
        if (!pageData.data || pageData.data.length === 0) {
          break; // acabou os dados
        }
      
        allOperations.push(...pageData.data);
      
        currentPage++;
      }
      
      if (allOperations.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No operations found.",
            },
          ],
        };
      }

      
      return {
        content: [
          {
            type: "text",
            text: `These are the operations found: ${JSON.stringify(allOperations, null, 2)}`,
          },
        ],
      };
    },
  );
  

  server.tool(
    "get_operations_by_username",
    "Get next page of Operations",
    {
        name: z.string(),
    },
    async ({name}) => {
      const financePlannerUrlToken = `${FINANCE_BASE}/auth/login`;
      const financePlannerUrlOperations = `${FINANCE_BASE}/operations`;
      const financePlannerUrlUser = `${FINANCE_BASE}/user`;
      const loginResponse = await fetch(financePlannerUrlToken, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "seuEmail",
          password: "suaSenha",
        }),
      });
      
      const tokenData = await loginResponse.json();
      const accessToken = tokenData.data?.access_token;
      
      if (!accessToken) {
        throw new Error("Authentication failed: No access token returned.");
      }


      const userResponse = await fetch(`${financePlannerUrlUser}?name=${name}`, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      const usersData: UsersResponse = await userResponse.json();
      
      if (!usersData.data || usersData.data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No Users found.",
            },
          ],
        };
      }

      let currentPage = 1;
      const limit = 10;
      let allOperations: OperationsResponse["data"] = [];
      while(true){
        const Operations = await fetch(`${financePlannerUrlOperations}?user_id=${usersData.data[0].id}&page=${currentPage}&limit=${limit}`, {
          method: "GET",
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });
  
        const operationsData: OperationsResponse = await Operations.json();

        if(!operationsData.data || operationsData.data.length === 0){
          break;
        }

        allOperations.push(...operationsData.data);
      
        currentPage++;
      }
      

      if (allOperations.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No operations found.",
            },
          ],
        };
      }
      
      return {
        content: [
            {
                type: "text",
                text: `These are the operations found: ${JSON.stringify(allOperations, null, 2)} and this is the user ${usersData.data[0]}`,
              },
        ],
      };
    },
  );

  server.tool(
    "get_goals_by_username",
    "Get goals of one use",
    {
        name: z.string(),
    },
    async ({name}) => {
      const financePlannerUrlToken = `${FINANCE_BASE}/auth/login`;
      const financePlannerUrlGoals = `${FINANCE_BASE}/goals`;
      const financePlannerUrlUser = `${FINANCE_BASE}/user`;
      const loginResponse = await fetch(financePlannerUrlToken, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "seuEmail",
          password: "suaSenha",
        }),
      });
      
      const tokenData = await loginResponse.json();
      const accessToken = tokenData.data?.access_token;
      
      if (!accessToken) {
        throw new Error("Authentication failed: No access token returned.");
      }


      const userResponse = await fetch(`${financePlannerUrlUser}?name=${name}`, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      const usersData: UsersResponse = await userResponse.json();
      
      if (!usersData.data || usersData.data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No Users found.",
            },
          ],
        };
      }

      let currentPage = 1;
      const limit = 10;
      let allOperations: GoalsResponse["data"] = [];
      while(true){
        const goals = await fetch(`${financePlannerUrlGoals}?user_id=${usersData.data[0].id}&page=${currentPage}&limit=${limit}`, {
          method: "GET",
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });
  
        const goalsData: GoalsResponse = await goals.json();

        if(!goalsData.data || goalsData.data.length === 0){
          break;
        }

        allOperations.push(...goalsData.data);
      
        currentPage++;
      }
      

      if (allOperations.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No goals found.",
            },
          ],
        };
      }
      
      return {
        content: [
            {
                type: "text",
                text: `These are the goals found: ${JSON.stringify(allOperations, null, 2)}`,
              },
        ],
      };
    },
  );

  server.tool(
    "create_operation",
    "Create a new financial operation",
    {
      type: z.enum(['CREDIT', 'DEBIT']),
      value: z.number(),
      date: z.string().default(new Date().toISOString()),
      user_id: z.number(),
      category: z.string(),
      operationId: z.string(),
    },
    async ({ type, value, date, category, user_id, operationId }) => {
      const financePlannerUrlToken = `${FINANCE_BASE}/auth/login`;
      const financePlannerUrlOperations = `${FINANCE_BASE}/operations`;
  
      // Login
      const loginResponse = await fetch(financePlannerUrlToken, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "seuEmail",
          password: "suaSenha",
        }),
      });
  
      const tokenData = await loginResponse.json();
      const accessToken = tokenData.data?.access_token;
  
      if (!accessToken) {
        throw new Error("Authentication failed: No access token returned.");
      }
  
      
      const postResponse = await fetch(financePlannerUrlOperations, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type,
          value,
          date,
          category,
          user_id,
          operationId
        }),
      });
  
      const result = await postResponse.json();
  
      if (!postResponse.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create operation: ${JSON.stringify(result)}`,
            },
          ],
        };
      }
  
      return {
        content: [
          {
            type: "text",
            text: `Operation created successfully: ${JSON.stringify(result.data, null, 2)}`,
          },
        ],
      };
    }
  );

  async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });