import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI Code Generation Router
  ai: router({
    generateCode: publicProcedure
      .input(
        z.object({
          prompt: z.string().min(1, "Prompt cannot be empty"),
          language: z.string().default("typescript"),
          context: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const systemPrompt = `You are an expert full-stack developer AI assistant. Generate high-quality, production-ready code based on user requests.

Guidelines:
- Write clean, well-documented code
- Follow best practices for the requested language
- Include error handling and type safety
- Provide explanations for complex logic
- Optimize for performance and maintainability

Context: ${input.context || "General code generation"}`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: input.prompt,
              },
            ],
            maxTokens: 4096,
          });

          const content = typeof response.choices?.[0]?.message?.content === 'string' 
            ? response.choices[0].message.content 
            : JSON.stringify(response.choices?.[0]?.message?.content) || "";

          // Extract code blocks from markdown
          const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g;
          const codeBlocks = [];
          let match;

          while ((match = codeBlockRegex.exec(content)) !== null) {
            codeBlocks.push(match[1]);
          }

          return {
            success: true,
            code: codeBlocks.length > 0 ? codeBlocks[0] : content,
            fullResponse: content,
            language: input.language,
          };
        } catch (error) {
          console.error("[AI] Code generation error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate code",
            code: "",
            fullResponse: "",
          };
        }
      }),

    analyzeCode: publicProcedure
      .input(
        z.object({
          code: z.string().min(1),
          language: z.string().default("typescript"),
          analysisType: z.enum(["security", "performance", "quality", "accessibility"]).default("quality"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const analysisPrompts = {
            security: "Analyze this code for security vulnerabilities and provide recommendations.",
            performance: "Analyze this code for performance issues and optimization opportunities.",
            quality: "Analyze this code for code quality, maintainability, and best practices.",
            accessibility: "Analyze this code for accessibility issues and improvements.",
          };

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert code reviewer. ${analysisPrompts[input.analysisType]} Provide specific, actionable recommendations.`,
              },
              {
                role: "user",
                content: `Please analyze this ${input.language} code:\n\n\`\`\`${input.language}\n${input.code}\n\`\`\``,
              },
            ],
            maxTokens: 2048,
          });

          return {
            success: true,
            analysis: typeof response.choices?.[0]?.message?.content === 'string'
              ? response.choices[0].message.content
              : JSON.stringify(response.choices?.[0]?.message?.content) || "",
            type: input.analysisType,
          };
        } catch (error) {
          console.error("[AI] Code analysis error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to analyze code",
            analysis: "",
          };
        }
      }),

    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
            })
          ),
          context: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const systemMessage = `You are an expert full-stack developer AI assistant helping users build applications. 
You think like a senior developer with deep knowledge of:
- Architecture and system design
- Full-stack web development
- Security best practices
- Performance optimization
- Testing and quality assurance

${input.context ? `Context: ${input.context}` : ""}`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemMessage,
              },
              ...input.messages,
            ],
            maxTokens: 2048,
          });

          return {
            success: true,
            response: typeof response.choices?.[0]?.message?.content === 'string'
              ? response.choices[0].message.content
              : JSON.stringify(response.choices?.[0]?.message?.content) || "",
          };
        } catch (error) {
          console.error("[AI] Chat error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to process chat",
            response: "",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
