# FlowchartGPT

FlowchartGPT is your intelligent assistant for creating and understanding flowcharts and diagrams. It provides an intuitive interface for visualizing processes, algorithms, and workflows, similar to working with a professional diagram designer. With features like AI-powered chat assistance and interactive flowchart creation, & Edit via Prompt advantage, FlowchartGPT helps you create professional diagrams effortlessly.

Built with Next.js and modern AI technology, this open-source template helps developers create their own flowchart generation tools. As more professionals need to create clear visual representations of processes, this template enables you to build your own flowchart platform quickly and easily.

## Live Demo

[https://flowchart-gpt.vercel.app/](https://flowchart-gpt.vercel.app/)

## Features

- Flowchart creation interface via Prompting
- AI-powered assistant for diagram suggestions
- Edit Via Prompt Facility

## Technologies Used

- Next.js and React for Frontend and Backend
- Database: MongoDB
- AI Integration: Anthropic's Claude
- Flowchart Generation: Mermaid.js
- State Management: React Context

## Use Cases

- Generate flowcharts from natural language descriptions
- Create process documentation for business workflows
- Design algorithm visualizations for technical documentation

## Installation Steps

### 1. Clone the repository:
```bash
git clone https://github.com/yourusername/FlowchartGPT.git
cd FlowchartGPT
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Set up the database:
Ensure you have [MongoDB](https://www.mongodb.com/) installed and running on your system, or use a cloud-hosted MongoDB service like [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database). Create a new Cluster, select a free plan, and copy the connection string, this will be required in the next step.

### 4. Set up environment variables:
Create a `.env.local` file in the root directory and add the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 5. Run the development server:
```bash
npm run dev
```

### 6. Open your browser and navigate to `http://localhost:3000`

## Screenshots



## How to use the application

1. Register for a new account or log in
2. Create a new flowchart project
3. AI assistant to build your diagram
4. Export or share your flowchart

## Contributing

We welcome contributions! Here's how you can help make FlowchartGPT even better:

1. Fork the project (`gh repo fork https://github.com/yourusername/FlowchartGPT.git`)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Please open an issue in the GitHub repository for any queries or support.
