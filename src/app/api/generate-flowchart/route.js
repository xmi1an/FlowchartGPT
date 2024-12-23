// src/app/api/generate-flowchart/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const FLOWCHART_PROMPTS = {
  process: {
    instruction: "Create a standard process flow diagram",
    example: `graph TD
      A([Start]) --> B[First Step]
      B --> C[Second Step]
      C --> D([End])`
  },
  userJourney: {
    instruction: "Create a user journey map with touchpoints and experiences",
    example: `graph LR
      A([User Entry]) --> B[Landing Page]
      B --> C{Sign Up?}
      C -->|Yes| D[Registration]
      C -->|No| E[Browse as Guest]`
  },
  systemFlow: {
    instruction: "Design a technical system architecture showing components and data flow",
    example: `graph TD
      A[(Database)] --> B[API Server]
      B --> C{Load Balancer}
      C --> D[Web Server 1]
      C --> E[Web Server 2]`
  }
};

export async function POST(request) {
  try {
    const { prompt, config, type, currentFlowchart } = await request.json();
    console.log('Request type:', type);

    // Handle chat/ideation requests
    if (type === 'chat') {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful flowchart design assistant who helps brainstorm improvements and ideas for flowcharts.
            When analyzing flowcharts, focus on:
            - Process efficiency and optimization
            - Potential missing steps or edge cases
            - Error handling and fallback scenarios
            - User experience and clarity
            - Best practices for the specific type of flowchart
            
            Keep responses friendly, clear, and actionable. If the user asks about making specific changes, explain the concept but don't try to modify the Mermaid code directly.`
          },
          {
            role: "user",
            content: `The current flowchart is:\n${currentFlowchart}\n\nUser's question/request: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return NextResponse.json({ 
        response: chatCompletion.choices[0].message.content.trim()
      });
    }

    // Handle summary generation
    if (type === 'summary') {
      const summaryCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze the provided Mermaid.js flowchart code and provide:
            1. A clear step-by-step explanation of what happens in the process
            2. 3-4 key insights or important points about this process
            
            Format your response exactly as:
            STEPS:
            1. First step explanation
            2. Second step explanation
            etc.

            KEY POINTS:
            • First key insight
            • Second key insight
            etc.`
          },
          {
            role: "user",
            content: currentFlowchart
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      const explanation = summaryCompletion.choices[0].message.content;
      
      try {
        const stepsMatch = explanation.match(/STEPS:\n([\s\S]*?)(?=\n\nKEY POINTS:)/);
        const keyPointsMatch = explanation.match(/KEY POINTS:\n([\s\S]*?)$/);
        
        const summary = stepsMatch ? stepsMatch[1].trim() : "Could not parse steps.";
        const keyPoints = keyPointsMatch 
          ? keyPointsMatch[1]
            .trim()
            .split('\n')
            .map(point => point.replace(/^[•\s]+/, ''))
            .filter(point => point.length > 0)
          : ["Could not parse key points."];

        console.log('Parsed Summary:', { summary, keyPoints });
        return NextResponse.json({ summary, keyPoints });
      } catch (parseError) {
        console.error('Failed to parse explanation:', parseError);
        return NextResponse.json({
          summary: explanation,
          keyPoints: []
        });
      }
    }

    // Handle Mermaid syntax display
    if (type === 'mermaid') {
      return NextResponse.json({ 
        mermaidCode: currentFlowchart.trim() 
      });
    }

    // Handle pseudocode generation
    if (type === 'pseudocode') {
      const pseudocodeCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Convert the given Mermaid.js flowchart into clear, readable pseudocode following these rules:
            1. Use proper indentation for nested blocks
            2. Use standard control flow statements (IF, WHILE, FOR, etc.)
            3. Keep variable names meaningful
            4. Include comments for clarity
            5. Make it easy to understand for non-programmers
            6. Preserve the flowchart's logic exactly
            7. Use clear BEGIN and END markers
            8. Add helpful comments explaining key decision points
            9. Use consistent formatting throughout`
          },
          {
            role: "user",
            content: `Convert this flowchart to pseudocode:\n${currentFlowchart}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      return NextResponse.json({ 
        pseudocode: pseudocodeCompletion.choices[0].message.content.trim() 
      });
    }

    // Handle initial flowchart generation
    const flowchartType = FLOWCHART_PROMPTS[config?.type] || FLOWCHART_PROMPTS.process;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert flowchart designer specializing in ${config?.type || 'process'} diagrams.
          ${flowchartType.instruction}
          
          Rules:
          1. Use the appropriate style for ${config?.type || 'process'} diagrams
          2. Follow the structure shown in this example:
          ${flowchartType.example}
          3. Maintain proper node hierarchy and connection flow
          4. Use descriptive but concise node text
          5. Include proper symbols for different node types
          6. Use proper Mermaid.js syntax
          7. Output only valid Mermaid.js code
          8. Ensure all connections use proper arrow syntax (-->)
          9. Use meaningful node IDs that describe their purpose`
        },
        {
          role: "user",
          content: `Create a ${config?.type || 'process'} diagram for: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    let mermaidCode = completion.choices[0].message.content.trim();
    
    // Validate the generated code
    if (!mermaidCode.includes('graph') || !mermaidCode.includes('-->')) {
      throw new Error('Generated invalid flowchart code');
    }
    
    return NextResponse.json({ mermaidCode });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}