import transactionsData from "@/services/mockData/transactions.json";

class TransactionService {
  constructor() {
    this.transactions = [...transactionsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.transactions];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.transactions.find(transaction => transaction.Id === id);
  }

  async getByFarmId(farmId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.transactions.filter(transaction => transaction.farmId === farmId.toString());
  }

  async create(transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTransaction = {
      ...transactionData,
      Id: Math.max(...this.transactions.map(t => t.Id)) + 1,
      farmId: transactionData.farmId.toString(),
      date: transactionData.date || new Date().toISOString()
    };
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const index = this.transactions.findIndex(transaction => transaction.Id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...transactionData };
      return { ...this.transactions[index] };
    }
    throw new Error("Transaction not found");
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const index = this.transactions.findIndex(transaction => transaction.Id === id);
    if (index !== -1) {
      const deletedTransaction = this.transactions.splice(index, 1)[0];
      return { ...deletedTransaction };
    }
    throw new Error("Transaction not found");
  }

  async getSummaryByFarmId(farmId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const farmTransactions = this.transactions.filter(t => t.farmId === farmId.toString());
    
    const income = farmTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = farmTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      profit: income - expenses,
      transactionCount: farmTransactions.length
    };
  }
}

export default new TransactionService();