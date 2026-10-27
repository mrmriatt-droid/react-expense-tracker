import { useEffect, useState } from "react";
import "./App.css";

const categories = [
  { value: "food", label: "Food & Drinks" },
  { value: "transport", label: "Transportation" },
  { value: "shopping", label: "Shopping" },
  { value: "bills", label: "Bills & Subscriptions" },
  { value: "personal", label: "Personal Care" },
  { value: "other", label: "Other" },
];

function App() {
  //نسترجع المصروفات
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("highest");
  const [date, setDate] = useState("");
  // تصنيف المصروف الجديد
  const [category, setCategory] = useState("food");

  // تصنيف المصروف أثناء التعديل
  const [editCategory, setEditCategory] = useState("food");
  const [filterCategory, setFilterCategory] = useState("all");
  //حالات التعديل
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  // دالة التعديل
  function startEditing(expense) {
    setEditingId(expense.id);
    setEditName(expense.name);
    setEditAmount(String(expense.amount));
    setEditDate(expense.date);
    setEditCategory(expense.category || "food");
  }
  //دالة حفظ التعديل
  function saveEdit(e) {
    e.preventDefault();

    if (
      !editName.trim() ||
      editAmount.trim() === "" ||
      !Number.isFinite(Number(editAmount)) ||
      Number(editAmount) <= 0 ||
      !editDate
    ) {
      alert("Please enter valid expense details.");
      return;
    }

    setExpenses(
      expenses.map((expense) =>
        expense.id === editingId
          ? {
              ...expense,
              name: editName.trim(),
              amount: Number(editAmount),
              date: editDate,
              category: editCategory,
            }
          : expense,
      ),
    );
    setEditingId(null);
  }
  //نسترجع الميزانية
  const [budget, setBudget] = useState(() => {
    return localStorage.getItem("budget") || "";
  });

  //حفظ المصروفات
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);
  //حفظ الميزانية
  useEffect(() => {
    localStorage.setItem("budget", budget);
  }, [budget]);

  //تضيف نصروف
  function addExpense(e) {
    e.preventDefault();

    if (
      !name.trim() ||
      amount.trim() === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0||
      !date
    ) {
      alert("Enter a name and a valid amount!");
      return;
    }

    const newExpense = {
      //crypto.randomUUID() — تنشئ معرّفًا عشوائيًا وفريدًا تقريبًا
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: Number(amount),
      date: date,
      category: category,
    };

    setExpenses([...expenses, newExpense]);
    setName("");
    setAmount("");
    setDate("");
    setCategory("food");
  }

  //حساب المجموع
  const total = expenses.reduce((sum, expense) => {
    return sum + expense.amount;
  }, 0);
  const remaining = Number(budget) - total;
  const budgetPercentage =
    Number(budget) > 0 ? Math.min((total / Number(budget)) * 100, 100) : 0;
  //دالة الفلترة حق الحث والتصنيف
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || expense.category == filterCategory;
    return matchesSearch && matchesCategory;
  });
  //دالة الحذف
  function deleteExpense(id) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this expense?",
    );
    if (!confirmDelete) return;
    setExpenses(expenses.filter((expense) => expense.id !== id));
  }

  // المصروفات من الاكير الى الاصغر
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === "highest") return b.amount - a.amount;
    if (sortBy === "lowest") return a.amount - b.amount;
    if (sortBy === "newest") {
      return expenses.indexOf(b) - expenses.indexOf(a);
    }
    return 0;
  });
  //دالة حساب احصائيات التصنيفات
  const categoryTotals = categories.map((cat) => ({
    ...cat,
    total: expenses
      .filter((expense) => expense.category === cat.value)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }))
      .filter((cat) => cat.total > 0);
          
  return (
    <div className="app">
      <h1>Expense Tracker</h1>
      <p>Track your expenses and manage your budget.</p>

      <div>
        <h2 className="Monthly">Monthly Budget</h2>
        <input
          type="number"
          placeholder="Enter your budget (SAR)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <p> Budget : {Number(budget) || 0} SAR</p>
        <p className={remaining < 0 ? "over-budget" : "within-budget"}>
          {" "}
          Remaining : {remaining} SAR
        </p>
        <div className="progress-bar">
          <div
            className={`progress-fill ${remaining < 0 ? "progress-over" : ""}`}
            style={{ width: `${budgetPercentage}%` }}
          ></div>
        </div>

        <p>{budgetPercentage.toFixed(0)}% of budget used</p>
      </div>
      <form onSubmit={addExpense}>
        <input
          type="text"
          placeholder="Expense name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (SAR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select className="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">Add Expense</button>
      </form>

      <div className="exs">
        <h2 className="My">My Expenses</h2>
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
<div className="sort-cat">
        <select
        className="category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
          <option value="newest">Newest first</option>
        </select>
</div>
        <p className="numexp">Number of expenses: {expenses.length}</p>

        <div className="category-stats">
          {categoryTotals.map((cat) => (
            <div className="category-card" key={cat.value}>
              <span>{cat.label} </span>
              <strong>{cat.total.toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div>
          {sortedExpenses.length === 0 ? (
            <p className="empty-message">No expenses found.</p>
          ) : (
            sortedExpenses.map((expense) => (
              <div className="exsitem" key={expense.id}>
                <div className="expense-info">
                  <div className="expense-main">
                    <span>{expense.name} </span>
                    <span>{expense.amount} SAR </span>
                  </div>
                  <small>{expense.date}</small>
                  <small>
                    {
                      categories.find((cat) => cat.value === expense.category)
                        .label
                    }
                  </small>
                </div>
                <div className="expense-actions">
                  <button onClick={() => deleteExpense(expense.id)}>
                    Delete
                  </button>
                  <button onClick={() => startEditing(expense)}>Edit</button>
                </div>
                {editingId === expense.id && (
                  <form onSubmit={saveEdit} className="edit-form">
                    <input
                      type="text"
                      placeholder="Expense name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Amount (SAR)"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      required
                    />

                    <select
                     className="edit-category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                    />

                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
        <h3>Total: {total} SAR</h3>
      </div>
    </div>
  );
}

export default App;
