// ========================================
// BANKING SYSTEM - PURE JAVASCRIPT VERSION
// ========================================
// Versi JavaScript murni untuk demo langsung tanpa setup

// Enum simulasi
const TransactionType = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
  TRANSFER: "TRANSFER",
};

const TransactionStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const AccountType = {
  SAVINGS: "SAVINGS",
  CHECKING: "CHECKING",
  PREMIUM: "PREMIUM",
};

// Transaction Class
class Transaction {
  constructor(type, amount, status, description, fromAccount, toAccount) {
    this.id = this.generateTransactionId();
    this.type = type;
    this.amount = amount;
    this.fromAccount = fromAccount;
    this.toAccount = toAccount;
    this.timestamp = new Date();
    this.status = status;
    this.description = description;
  }

  generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  getTransactionDetails() {
    return `${this.id} | ${this.type} | ${this.amount} | ${
      this.status
    } | ${this.timestamp.toISOString()}`;
  }
}

// Abstract Account Class (simulated)
class Account {
  constructor(accountHolder, accountType, initialBalance = 0) {
    this.accountNumber = this.generateAccountNumber();
    this.accountHolder = accountHolder;
    this.balance = initialBalance;
    this.accountType = accountType;
    this.transactions = [];
    this.isActive = true;
  }

  generateAccountNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString().substring(2, 8);
    return timestamp + random;
  }

  // Getter methods
  getAccountNumber() {
    return this.accountNumber;
  }
  getAccountHolder() {
    return this.accountHolder;
  }
  getBalance() {
    return this.balance;
  }
  getAccountType() {
    return this.accountType;
  }
  getTransactions() {
    return [...this.transactions];
  }
  isAccountActive() {
    return this.isActive;
  }

  // Abstract methods (akan di-override)
  validateTransaction(amount) {
    throw new Error("Must implement validateTransaction");
  }

  getTransactionFee(amount) {
    throw new Error("Must implement getTransactionFee");
  }

  // Deposit method
  deposit(amount, description = "Deposit") {
    if (amount <= 0) {
      console.log("❌ Jumlah deposit harus lebih dari 0");
      this.addTransaction(
        TransactionType.DEPOSIT,
        amount,
        TransactionStatus.FAILED,
        "Invalid amount"
      );
      return false;
    }

    if (!this.isActive) {
      console.log("❌ Akun tidak aktif");
      this.addTransaction(
        TransactionType.DEPOSIT,
        amount,
        TransactionStatus.FAILED,
        "Account inactive"
      );
      return false;
    }

    if (!this.validateTransaction(amount)) {
      this.addTransaction(
        TransactionType.DEPOSIT,
        amount,
        TransactionStatus.FAILED,
        "Validation failed"
      );
      return false;
    }

    this.balance += amount;
    this.addTransaction(
      TransactionType.DEPOSIT,
      amount,
      TransactionStatus.SUCCESS,
      description
    );

    console.log(`✅ Deposit berhasil: Rp ${amount.toLocaleString()}`);
    console.log(`💰 Saldo saat ini: Rp ${this.balance.toLocaleString()}`);
    return true;
  }

  // Withdraw method
  withdraw(amount, description = "Withdrawal") {
    if (amount <= 0) {
      console.log("❌ Jumlah penarikan harus lebih dari 0");
      this.addTransaction(
        TransactionType.WITHDRAWAL,
        amount,
        TransactionStatus.FAILED,
        "Invalid amount"
      );
      return false;
    }

    if (!this.isActive) {
      console.log("❌ Akun tidak aktif");
      this.addTransaction(
        TransactionType.WITHDRAWAL,
        amount,
        TransactionStatus.FAILED,
        "Account inactive"
      );
      return false;
    }

    const fee = this.getTransactionFee(amount);
    const totalAmount = amount + fee;

    if (this.balance < totalAmount) {
      console.log("❌ Saldo tidak mencukupi");
      console.log(`💰 Saldo: Rp ${this.balance.toLocaleString()}`);
      console.log(
        `💸 Dibutuhkan: Rp ${totalAmount.toLocaleString()} (termasuk fee: Rp ${fee.toLocaleString()})`
      );
      this.addTransaction(
        TransactionType.WITHDRAWAL,
        amount,
        TransactionStatus.FAILED,
        "Insufficient balance"
      );
      return false;
    }

    if (!this.validateTransaction(amount)) {
      this.addTransaction(
        TransactionType.WITHDRAWAL,
        amount,
        TransactionStatus.FAILED,
        "Validation failed"
      );
      return false;
    }

    this.balance -= totalAmount;
    this.addTransaction(
      TransactionType.WITHDRAWAL,
      amount,
      TransactionStatus.SUCCESS,
      `${description} (Fee: Rp ${fee.toLocaleString()})`
    );

    console.log(`✅ Penarikan berhasil: Rp ${amount.toLocaleString()}`);
    if (fee > 0) {
      console.log(`💳 Biaya transaksi: Rp ${fee.toLocaleString()}`);
    }
    console.log(`💰 Saldo saat ini: Rp ${this.balance.toLocaleString()}`);
    return true;
  }

  // Transfer method
  transferTo(targetAccount, amount, description = "Transfer") {
    if (amount <= 0) {
      console.log("❌ Jumlah transfer harus lebih dari 0");
      return false;
    }

    if (!this.isActive || !targetAccount.isAccountActive()) {
      console.log("❌ Salah satu akun tidak aktif");
      return false;
    }

    if (this.accountNumber === targetAccount.getAccountNumber()) {
      console.log("❌ Tidak bisa transfer ke akun yang sama");
      return false;
    }

    const fee = this.getTransactionFee(amount);
    const totalAmount = amount + fee;

    if (this.balance < totalAmount) {
      console.log("❌ Saldo tidak mencukupi untuk transfer");
      return false;
    }

    if (
      !this.validateTransaction(amount) ||
      !targetAccount.validateTransaction(amount)
    ) {
      return false;
    }

    this.balance -= totalAmount;
    targetAccount.balance += amount;

    this.addTransaction(
      TransactionType.TRANSFER,
      amount,
      TransactionStatus.SUCCESS,
      `Transfer ke ${targetAccount.getAccountHolder()} (Fee: Rp ${fee.toLocaleString()})`
    );

    targetAccount.addTransaction(
      TransactionType.TRANSFER,
      amount,
      TransactionStatus.SUCCESS,
      `Transfer dari ${this.accountHolder}`
    );

    console.log(`✅ Transfer berhasil: Rp ${amount.toLocaleString()}`);
    console.log(`📤 Dari: ${this.accountHolder} (${this.accountNumber})`);
    console.log(
      `📥 Ke: ${targetAccount.getAccountHolder()} (${targetAccount.getAccountNumber()})`
    );
    if (fee > 0) {
      console.log(`💳 Biaya transfer: Rp ${fee.toLocaleString()}`);
    }
    console.log(`💰 Saldo saat ini: Rp ${this.balance.toLocaleString()}`);
    return true;
  }

  addTransaction(type, amount, status, description, fromAccount, toAccount) {
    const transaction = new Transaction(
      type,
      amount,
      status,
      description,
      fromAccount,
      toAccount
    );
    this.transactions.push(transaction);
  }

  displayAccountInfo() {
    console.log("\n" + "=".repeat(50));
    console.log(`👤 Pemegang Akun: ${this.accountHolder}`);
    console.log(`🏦 Nomor Akun: ${this.accountNumber}`);
    console.log(`📋 Jenis Akun: ${this.accountType}`);
    console.log(`💰 Saldo: Rp ${this.balance.toLocaleString()}`);
    console.log(`✅ Status: ${this.isActive ? "Aktif" : "Tidak Aktif"}`);
    console.log("=".repeat(50));
  }

  displayTransactionHistory(limit = 5) {
    console.log("\n📊 RIWAYAT TRANSAKSI");
    console.log("=".repeat(60));

    if (this.transactions.length === 0) {
      console.log("Belum ada transaksi");
      return;
    }

    const recentTransactions = this.transactions.slice(-limit).reverse();

    recentTransactions.forEach((txn, index) => {
      const statusIcon = txn.status === TransactionStatus.SUCCESS ? "✅" : "❌";
      const typeIcon = this.getTransactionIcon(txn.type);

      console.log(`${index + 1}. ${statusIcon} ${typeIcon} ${txn.type}`);
      console.log(`   💰 Jumlah: Rp ${txn.amount.toLocaleString()}`);
      console.log(`   📝 Keterangan: ${txn.description}`);
      console.log(`   🕐 Waktu: ${txn.timestamp.toLocaleString("id-ID")}`);
      console.log("   " + "-".repeat(40));
    });
  }

  getTransactionIcon(type) {
    switch (type) {
      case TransactionType.DEPOSIT:
        return "📥";
      case TransactionType.WITHDRAWAL:
        return "📤";
      case TransactionType.TRANSFER:
        return "🔄";
      default:
        return "💳";
    }
  }
}

// Savings Account
class SavingsAccount extends Account {
  constructor(accountHolder, initialBalance = 0) {
    super(accountHolder, AccountType.SAVINGS, initialBalance);
    this.MINIMUM_BALANCE = 50000;
    this.WITHDRAWAL_LIMIT = 5000000;
  }

  validateTransaction(amount) {
    if (amount > this.WITHDRAWAL_LIMIT) {
      console.log(
        `❌ Jumlah melebihi limit harian: Rp ${this.WITHDRAWAL_LIMIT.toLocaleString()}`
      );
      return false;
    }
    return true;
  }

  getTransactionFee(amount) {
    return amount >= 1000000 ? 5000 : 0;
  }

  checkMinimumBalance() {
    return this.balance >= this.MINIMUM_BALANCE;
  }

  withdraw(amount, description = "Withdrawal") {
    const fee = this.getTransactionFee(amount);
    const totalAmount = amount + fee;

    if (this.balance - totalAmount < this.MINIMUM_BALANCE) {
      console.log(
        `❌ Penarikan gagal: Saldo tidak boleh kurang dari Rp ${this.MINIMUM_BALANCE.toLocaleString()}`
      );
      this.addTransaction(
        TransactionType.WITHDRAWAL,
        amount,
        TransactionStatus.FAILED,
        "Below minimum balance"
      );
      return false;
    }

    return super.withdraw(amount, description);
  }
}

// Checking Account
class CheckingAccount extends Account {
  constructor(accountHolder, initialBalance = 0) {
    super(accountHolder, AccountType.CHECKING, initialBalance);
    this.OVERDRAFT_LIMIT = 1000000;
  }

  validateTransaction(amount) {
    return true;
  }

  getTransactionFee(amount) {
    return 2500;
  }

  withdraw(amount, description = "Withdrawal") {
    const fee = this.getTransactionFee(amount);
    const totalAmount = amount + fee;

    if (this.balance - totalAmount < -this.OVERDRAFT_LIMIT) {
      console.log(
        `❌ Penarikan melebihi batas overdraft: Rp ${this.OVERDRAFT_LIMIT.toLocaleString()}`
      );
      this.addTransaction(
        TransactionType.WITHDRAWAL,
        amount,
        TransactionStatus.FAILED,
        "Overdraft limit exceeded"
      );
      return false;
    }

    if (amount <= 0 || !this.isActive) {
      return false;
    }

    this.balance -= totalAmount;
    this.addTransaction(
      TransactionType.WITHDRAWAL,
      amount,
      TransactionStatus.SUCCESS,
      `${description} (Fee: Rp ${fee.toLocaleString()})`
    );

    console.log(`✅ Penarikan berhasil: Rp ${amount.toLocaleString()}`);
    console.log(`💳 Biaya transaksi: Rp ${fee.toLocaleString()}`);
    console.log(`💰 Saldo saat ini: Rp ${this.balance.toLocaleString()}`);

    if (this.balance < 0) {
      console.log(`⚠️  Akun dalam status overdraft!`);
    }

    return true;
  }

  getOverdraftStatus() {
    const inOverdraft = this.balance < 0;
    const overdraftAmount = inOverdraft ? Math.abs(this.balance) : 0;
    const availableCredit = this.OVERDRAFT_LIMIT - overdraftAmount;

    return { inOverdraft, overdraftAmount, availableCredit };
  }
}

// Premium Account
class PremiumAccount extends Account {
  constructor(accountHolder, initialBalance = 0) {
    super(accountHolder, AccountType.PREMIUM, initialBalance);
    this.MINIMUM_BALANCE = 10000000;
    this.rewardPoints = 0;
  }

  validateTransaction(amount) {
    return true;
  }

  getTransactionFee(amount) {
    return 0;
  }

  deposit(amount, description = "Deposit") {
    const success = super.deposit(amount, description);
    if (success) {
      const points = Math.floor(amount / 10000);
      this.rewardPoints += points;
      if (points > 0) {
        console.log(
          `🎁 Reward points: +${points} (Total: ${this.rewardPoints})`
        );
      }
    }
    return success;
  }

  getRewardPoints() {
    return this.rewardPoints;
  }

  redeemRewards(points) {
    if (points > this.rewardPoints) {
      console.log("❌ Reward points tidak mencukupi");
      return false;
    }

    const cashback = points * 100;
    this.rewardPoints -= points;
    this.balance += cashback;

    console.log(
      `✅ Redeem berhasil: ${points} points = Rp ${cashback.toLocaleString()}`
    );
    console.log(`🎁 Points tersisa: ${this.rewardPoints}`);
    this.addTransaction(
      TransactionType.DEPOSIT,
      cashback,
      TransactionStatus.SUCCESS,
      `Reward redemption: ${points} points`
    );
    return true;
  }
}

// Banking System
class BankingSystem {
  constructor() {
    this.accounts = new Map();
  }

  createAccount(accountHolder, accountType, initialBalance = 0) {
    let account;

    switch (accountType) {
      case AccountType.SAVINGS:
        account = new SavingsAccount(accountHolder, initialBalance);
        break;
      case AccountType.CHECKING:
        account = new CheckingAccount(accountHolder, initialBalance);
        break;
      case AccountType.PREMIUM:
        account = new PremiumAccount(accountHolder, initialBalance);
        break;
      default:
        throw new Error("Invalid account type");
    }

    this.accounts.set(account.getAccountNumber(), account);
    console.log(`✅ Akun berhasil dibuat untuk ${accountHolder}`);
    console.log(`🏦 Nomor akun: ${account.getAccountNumber()}`);
    console.log(`📋 Jenis akun: ${accountType}`);

    return account;
  }

  findAccount(accountNumber) {
    return this.accounts.get(accountNumber);
  }

  transferBetweenAccounts(
    fromAccountNumber,
    toAccountNumber,
    amount,
    description
  ) {
    const fromAccount = this.findAccount(fromAccountNumber);
    const toAccount = this.findAccount(toAccountNumber);

    if (!fromAccount || !toAccount) {
      console.log("❌ Salah satu akun tidak ditemukan");
      return false;
    }

    return fromAccount.transferTo(toAccount, amount, description);
  }

  displayAllAccounts() {
    console.log("\n🏦 DAFTAR SEMUA AKUN");
    console.log("=".repeat(80));

    if (this.accounts.size === 0) {
      console.log("Belum ada akun yang terdaftar");
      return;
    }

    this.accounts.forEach((account, accountNumber) => {
      console.log(`👤 ${account.getAccountHolder()}`);
      console.log(`🏦 ${accountNumber} (${account.getAccountType()})`);
      console.log(`💰 Saldo: Rp ${account.getBalance().toLocaleString()}`);
      console.log(
        `✅ Status: ${account.isAccountActive() ? "Aktif" : "Tidak Aktif"}`
      );
      console.log("-".repeat(60));
    });
  }
}

// ========================================
// DEMO FUNCTION
// ========================================
function runDemo() {
  console.log("🏦 SISTEM PERBANKAN SEDERHANA - DEMO");
  console.log("=".repeat(80));

  const bank = new BankingSystem();

  console.log("\n📝 MEMBUAT AKUN-AKUN BARU");
  const tabunganBudi = bank.createAccount(
    "Budi Santoso",
    AccountType.SAVINGS,
    100000
  );
  const giroSari = bank.createAccount(
    "Sari Dewi",
    AccountType.CHECKING,
    500000
  );
  const premiumAhmad = bank.createAccount(
    "Ahmad Wijaya",
    AccountType.PREMIUM,
    15000000
  );

  console.log("\n📋 INFORMASI AKUN");
  tabunganBudi.displayAccountInfo();
  giroSari.displayAccountInfo();
  premiumAhmad.displayAccountInfo();

  console.log("\n💰 TEST DEPOSIT");
  tabunganBudi.deposit(250000, "Setoran gaji");
  giroSari.deposit(1000000, "Modal usaha");
  premiumAhmad.deposit(5000000, "Investasi");

  console.log("\n💸 TEST PENARIKAN");
  tabunganBudi.withdraw(50000, "Belanja bulanan");
  giroSari.withdraw(1200000, "Bayar supplier");
  premiumAhmad.withdraw(2000000, "Pembelian aset");

  console.log("\n🔄 TEST TRANSFER");
  tabunganBudi.transferTo(giroSari, 100000, "Transfer ke Sari");
  premiumAhmad.transferTo(tabunganBudi, 500000, "Bantuan usaha");

  console.log("\n🎁 TEST FITUR PREMIUM");
  console.log(`Current reward points: ${premiumAhmad.getRewardPoints()}`);
  if (premiumAhmad.getRewardPoints() >= 100) {
    premiumAhmad.redeemRewards(100);
  }

  console.log("\n💳 TEST STATUS OVERDRAFT");
  const overdraftStatus = giroSari.getOverdraftStatus();
  console.log("Status Overdraft:", overdraftStatus);

  console.log("\n📊 RIWAYAT TRANSAKSI");
  tabunganBudi.displayTransactionHistory(3);

  bank.displayAllAccounts();

  console.log("\n🎉 DEMO SELESAI! Semua fitur OOP berhasil didemonstrasikan.");
}

// Jalankan demo
runDemo();
