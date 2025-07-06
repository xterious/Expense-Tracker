# 📊 Personal Finance Visualizer

A comprehensive web application for tracking personal finances with budgeting, visualization, and spending insights. Built with modern web technologies and designed specifically for the Indian market with full support for Indian Rupees (₹).

## 🌟 Features

### 💰 Transaction Management
- **Smart Transaction Tracking**: Add, edit, and delete transactions with quantity-based pricing
- **Indian Currency Support**: Full support for Indian Rupees (₹) with proper formatting and number system
- **Category Organization**: Predefined categories including Groceries, Utilities, Transport, Entertainment, Health, and Other
- **Date Validation**: Prevents future date entries to maintain data accuracy
- **Real-time Calculations**: Automatic total calculation based on quantity × price per unit

### 📊 Data Visualization
- **Monthly Expense Charts**: Interactive bar charts showing spending trends over time
- **Category Breakdown**: Pie charts displaying spending distribution by category with monthly filtering
- **Responsive Charts**: Mobile-optimized visualizations that adapt to screen size
- **Paginated Views**: Navigate through months of data with easy pagination controls

### 💼 Budget Management
- **Monthly Budget Setting**: Set and manage budgets for each spending category
- **Budget vs Actual Comparison**: Visual comparison charts showing budget performance
- **Spending Insights**: AI-powered insights highlighting overspending and savings opportunities
- **Real-time Budget Tracking**: Live updates on budget utilization and remaining amounts

### 📱 User Experience
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean tabbed interface organizing Dashboard, Budgets, and Transactions
- **Smart Forms**: Robust validation with helpful error messages and success notifications
- **Recent Transactions**: Quick access to your latest 3 transactions on the dashboard

### 🔧 Technical Features
- **Pagination**: Efficient handling of large transaction datasets
- **Real-time Updates**: Instant synchronization across all charts and views
- **Data Persistence**: Reliable MongoDB storage with proper indexing
- **Error Handling**: Comprehensive error management with user-friendly messages

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization
- React Hook Form + Zod validation
- Sonner for notifications

**Backend:**
- Next.js API Routes
- MongoDB with Mongoose ODM
- Server-side validation
- RESTful API design

**Deployment:**
- Vercel hosting
- MongoDB Atlas database
- Environment-based configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas account (free tier available)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/personal-finance-visualizer.git](https://github.com/xterious/Expense-Tracker)
   cd personal-finance-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expensetracker?retryWrites=true&w=majority
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Adding Transactions
1. Click "Add Transaction" from any page
2. Enter description, quantity, price per unit, and select category
3. Choose transaction date (current or past dates only)
4. Save to track your expense

### Managing Budgets
1. Navigate to the "Budgets" tab
2. Click "Edit" to modify monthly budget allocations
3. Set amounts for each category
4. Click "Save All" to apply changes
5. View budget vs actual comparison charts

### Analyzing Spending
- **Dashboard**: Overview with recent transactions and monthly trends
- **Category Breakdown**: Monthly spending distribution by category
- **Budget Analysis**: Detailed insights on budget performance and recommendations

## 🏗️ Project Structure

```
├── app/
│   ├── api/                   # API routes
│   │   ├── budgets/          # Budget CRUD operations
│   │   └── transactions/     # Transaction management
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main application page
├── components/               # React components
│   ├── ui/                   # shadcn/ui base components
│   ├── BudgetForm.tsx        # Budget management form
│   ├── CategoryBreakdownChart.tsx
│   ├── MonthlyExpensesChart.tsx
│   ├── SpendingInsights.tsx
│   └── TransactionForm.tsx
├── lib/
│   ├── db.ts                 # MongoDB connection
│   ├── utils.ts              # Utility functions
│   └── validators.ts         # Zod validation schemas
├── models/                   # MongoDB models
│   ├── Budget.ts
│   └── Transaction.ts
└── types/
    └── index.ts              # TypeScript definitions
```

## 🎯 Key Differentiators

### Indian Market Focus
- **Currency Localization**: Proper Indian Rupee formatting with lakhs/crores notation
- **Relevant Categories**: Spending categories tailored for Indian households
- **Cultural Considerations**: UI/UX designed for Indian user preferences

### Mobile-First Design
- **Responsive Charts**: Special mobile layouts for complex visualizations
- **Touch-Friendly Interface**: Optimized for mobile interaction
- **Progressive Enhancement**: Works seamlessly across all device sizes

### Performance Optimized
- **Efficient Pagination**: Handle thousands of transactions smoothly
- **Smart Caching**: Minimize unnecessary API calls
- **Optimized Queries**: Fast database operations with proper indexing

## 🔒 Security & Privacy

- **Input Validation**: Comprehensive server-side and client-side validation
- **Data Protection**: Secure MongoDB connections with environment variables
- **Error Handling**: Safe error messages that don't expose system details
- **Type Safety**: Full TypeScript implementation for runtime safety

## 🌟 Future Enhancements

- **Data Export**: CSV/Excel export functionality
- **Recurring Transactions**: Automated monthly expense tracking
- **Savings Goals**: Goal setting and progress tracking
- **Advanced Analytics**: ML-powered spending predictions
- **Multi-user Support**: Family budget management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for powerful data visualization
- [Next.js](https://nextjs.org/) for the amazing React framework
- [MongoDB Atlas](https://www.mongodb.com/atlas) for reliable database hosting
- [Vercel](https://vercel.com/) for seamless deployment

**Built with ❤️ for better financial management in India**

[Live Demo](https://expense-tracker-mauve-six.vercel.app/)
