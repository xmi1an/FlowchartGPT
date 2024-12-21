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
  },
  decision: {
    instruction: "Create a decision tree with clear decision points and outcomes",
    example: `graph TD
      A{Initial Decision} -->|Option 1| B[Outcome 1]
      A -->|Option 2| C[Outcome 2]
      B --> D{Secondary Decision}
      D -->|Yes| E[Final Result 1]
      D -->|No| F[Final Result 2]`
  },
  dataFlow: {
    instruction: "Map data movement between system components",
    example: `graph LR
      A[(Source DB)] --> B[ETL Process]
      B --> C[(Data Warehouse)]
      C --> D[Analytics]
      D --> E[Dashboard]`
  }
};

export async function POST(request) {
  try {
    const { prompt, config, type, currentFlowchart } = await request.json();
    console.log('Request type:', type);

    // Handle modifications to existing flowchart
    if (type === 'modification') {
      console.log('Modifying flowchart with prompt:', prompt);
      const modificationCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a flowchart modification expert. Given a current flowchart in Mermaid.js syntax and a requested change, you will:
            1. Keep the original graph TD/LR directive
            2. Maintain existing node IDs whenever possible
            3. For circles/states, use ((text)) syntax
            4. For rectangles/processes, use [text] syntax
            5. For diamonds/decisions, use {text} syntax
            6. For start/end nodes, use ([text]) syntax
            7. Return ONLY the modified Mermaid code, no explanations
            8. Preserve all existing connections unless specifically changed
            9. When changing node shapes, maintain all connections to/from that node
            10. When adding new nodes, use unique IDs that don't conflict with existing ones

            Example modifications:
            - Change shape: "[text]" to "((text))"
            - Add connection: "A --> B"
            - Change text: "Old Text" to "New Text"
            - Add new node: "NewNode[Text]" with connections`
          },
          {
            role: "user",
            content: `Current flowchart:\n${currentFlowchart}\n\nRequested change: ${prompt}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      // Generate a friendly confirmation message
      const messageCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Generate a brief, friendly confirmation of the changes made to the flowchart."
          },
          {
            role: "user",
            content: `The user requested: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      return NextResponse.json({ 
        mermaidCode: modificationCompletion.choices[0].message.content.trim(),
        response: messageCompletion.choices[0].message.content.trim()
      });
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
            content: `You are a pseudocode expert. Convert the given Mermaid.js flowchart into clear, readable pseudocode:
            1. Use proper indentation for nested blocks
            2. Use standard control flow statements (IF, WHILE, FOR, etc.)
            3. Keep variable names meaningful
            4. Include comments for clarity
            5. Make it easy to understand for non-programmers
            6. Preserve the logic of the flowchart exactly
            7. Add helpful line comments explaining key decision points`
          },
          {
            role: "user",
            content: `Convert this flowchart to pseudocode:\n${currentFlowchart}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return NextResponse.json({ 
        pseudocode: pseudocodeCompletion.choices[0].message.content.trim() 
      });
    }

    // Handle summary generation
    if (type === 'summary') {
      console.log('Generating summary for:', prompt);
      const summaryCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert at explaining flowcharts clearly and simply.
            Analyze the provided Mermaid.js flowchart code and provide:
            1. A step-by-step explanation of what happens in the process
            2. 3-4 key insights or important points about this process
            
            Format your response exactly as:
            STEPS:
            1. First step
            2. Second step
            etc.

            KEY POINTS:
            • First point
            • Second point
            etc.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const explanation = summaryCompletion.choices[0].message.content;
      console.log('Raw explanation:', explanation);

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

    // Handle initial flowchart generation
    const flowchartType = FLOWCHART_PROMPTS[config.type] || FLOWCHART_PROMPTS.process;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert flowchart designer specializing in ${config.type} diagrams.
          ${flowchartType.instruction}
          
          Rules:
          1. Use the appropriate style for ${config.type} diagrams
          2. Follow the structure shown in this example:
          ${flowchartType.example}
          3. Maintain proper node hierarchy and connection flow
          4. Use descriptive but concise node text
          5. Include proper symbols and connections based on the diagram type
          6. Output only the Mermaid.js code without any markdown formatting or explanations`
        },
        {
          role: "user",
          content: `Create a ${config.type} diagram for the following scenario: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    let mermaidCode = completion.choices[0].message.content.trim();
    
    return NextResponse.json({ mermaidCode });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}