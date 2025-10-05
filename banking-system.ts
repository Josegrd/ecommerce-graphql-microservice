// Enum untuk jenis transaksi
enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
}

// Enum untuk status transaksi
enum TransactionStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

// Enum untuk jenis akun
enum AccountType {
  SAVINGS = "SAVINGS", // Tabungan
  CHECKING = "CHECKING", // Giro
  PREMIUM = "PREMIUM", // Premium (untuk inheritance)
}

class Transaction {
  public readonly id: string;
  public readonly type: TransactionType;
  public readonly amount: number;
  public readonly fromAccount?: string;
  public readonly toAccount?: string;
  public readonly timestamp: Date;
  public readonly status: TransactionStatus;
  public readonly description: string;

  constructor(
    type: TransactionType,
    amount: number,
    status: TransactionStatus,
    description: string,
    fromAccount?: string,
    toAccount?: string
  ) {
    this.id = this.generateTransactionId();
    this.type = type;
    this.amount = amount;
    this.fromAccount = fromAccount;
    this.toAccount = toAccount;
    this.timestamp = new Date();
    this.status = status;
    this.description = description;
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  getTransactionDetails(): string {
    return `${this.id} | ${this.type} | ${this.amount} | ${
      this.status
    } | ${this.timestamp.toISOString()}`;
  }
}

abstract class Account {
  protected accountNumber: string;
  protected accountHolder: string;
  protected balance: number;
  protected accountType: AccountType;
  protected transactions: Transaction[];
  protected isActive: boolean;

  constructor(
    accountHolder: string,
    accountType: AccountType,
    initialBalance: number = 0
  ) {
    this.accountNumber = this.generateAccountNumber();
    this.accountHolder = accountHolder;
    this.balance = initialBalance;
    this.accountType = accountType;
    this.transactions = [];
    this.isActive = true;
  }

  // Private method untuk generate account number
  private generateAccountNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString().substring(2, 8);
    return timestamp + random;
  }

  public getAccountNumber(): string {
    return this.accountNumber;
  }

  public getAccountHolder(): string {
    return this.accountHolder;
  }

  public getBalance(): number {
    return this.balance;
  }

  public getAccountType(): AccountType {
    return this.accountType;
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions]; // Return copy untuk immutability, biar tidak bisa diubah dari luar
  }

  public isAccountActive(): boolean {
    return this.isActive;
  }

  // Abstract method yang harus diimplementasi oleh subclass (Polymorphism)
  protected abstract validateTransaction(amount: number): boolean;
  protected abstract getTransactionFee(amount: number): number;

  // Method untuk deposit
  public deposit(amount: number, description: string = "Deposit"): boolean {
    // Validasi input
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

    // Validasi khusus dari subclass
    if (!this.validateTransaction(amount)) {
      this.addTransaction(
        TransactionType.DEPOSIT,
        amount,
        TransactionStatus.FAILED,
        "Validation failed"
      );
      return false;
    }

    // Proses deposit
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

  // Method untuk penarikan
  public withdraw(amount: number, description: string = "Withdrawal"): boolean {
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

    // Cek saldo
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

  public transferTo(
    targetAccount: Account,
    amount: number,
    description: string = "Transfer"
  ): boolean {
    if (amount <= 0) {
      console.log("❌ Jumlah transfer harus lebih dari 0");
      this.addTransaction(
        TransactionType.TRANSFER,
        amount,
        TransactionStatus.FAILED,
        "Invalid amount",
        this.accountNumber,
        targetAccount.getAccountNumber()
      );
      return false;
    }

    if (!this.isActive || !targetAccount.isAccountActive()) {
      console.log("❌ Salah satu akun tidak aktif");
      this.addTransaction(
        TransactionType.TRANSFER,
        amount,
        TransactionStatus.FAILED,
        "Account inactive",
        this.accountNumber,
        targetAccount.getAccountNumber()
      );
      return false;
    }

    if (this.accountNumber === targetAccount.getAccountNumber()) {
      console.log("❌ Tidak bisa transfer ke akun yang sama");
      this.addTransaction(
        TransactionType.TRANSFER,
        amount,
        TransactionStatus.FAILED,
        "Same account",
        this.accountNumber,
        targetAccount.getAccountNumber()
      );
      return false;
    }

    const fee = this.getTransactionFee(amount);
    const totalAmount = amount + fee;

    // Cek saldo
    if (this.balance < totalAmount) {
      console.log("❌ Saldo tidak mencukupi untuk transfer");
      console.log(`💰 Saldo: Rp ${this.balance.toLocaleString()}`);
      console.log(
        `💸 Dibutuhkan: Rp ${totalAmount.toLocaleString()} (termasuk fee: Rp ${fee.toLocaleString()})`
      );
      this.addTransaction(
        TransactionType.TRANSFER,
        amount,
        TransactionStatus.FAILED,
        "Insufficient balance",
        this.accountNumber,
        targetAccount.getAccountNumber()
      );
      return false;
    }

    // Validasi dari kedua akun
    if (
      !this.validateTransaction(amount) ||
      !targetAccount.validateTransaction(amount)
    ) {
      this.addTransaction(
        TransactionType.TRANSFER,
        amount,
        TransactionStatus.FAILED,
        "Validation failed",
        this.accountNumber,
        targetAccount.getAccountNumber()
      );
      return false;
    }

    // Proses transfer
    this.balance -= totalAmount;
    targetAccount.balance += amount;

    // Catat transaksi di akun pengirim
    this.addTransaction(
      TransactionType.TRANSFER,
      amount,
      TransactionStatus.SUCCESS,
      `Transfer ke ${targetAccount.getAccountHolder()} (Fee: Rp ${fee.toLocaleString()})`,
      this.accountNumber,
      targetAccount.getAccountNumber()
    );

    // Catat transaksi di akun penerima
    targetAccount.addTransaction(
      TransactionType.TRANSFER,
      amount,
      TransactionStatus.SUCCESS,
      `Transfer dari ${this.accountHolder}`,
      this.accountNumber,
      targetAccount.getAccountNumber()
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

  // Method untuk menambah transaksi ke history
  protected addTransaction(
    type: TransactionType,
    amount: number,
    status: TransactionStatus,
    description: string,
    fromAccount?: string,
    toAccount?: string
  ): void {
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

  // Method untuk menampilkan informasi akun
  public displayAccountInfo(): void {
    console.log("\n" + "=".repeat(50));
    console.log(`👤 Pemegang Akun: ${this.accountHolder}`);
    console.log(`🏦 Nomor Akun: ${this.accountNumber}`);
    console.log(`📋 Jenis Akun: ${this.accountType}`);
    console.log(`💰 Saldo: Rp ${this.balance.toLocaleString()}`);
    console.log(`✅ Status: ${this.isActive ? "Aktif" : "Tidak Aktif"}`);
    console.log("=".repeat(50));
  }

  // Method untuk menampilkan history transaksi
  public displayTransactionHistory(limit: number = 10): void {
    console.log("\n📊 RIWAYAT TRANSAKSI");
    console.log("=".repeat(80));

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
      console.log(`   🆔 ID: ${txn.id}`);
      console.log("   " + "-".repeat(60));
    });
  }

  private getTransactionIcon(type: TransactionType): string {
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

class SavingsAccount extends Account {
  private readonly MINIMUM_BALANCE = 50000; // Saldo minimum Rp 50,000
  private readonly WITHDRAWAL_LIMIT = 5000000; // Limit penarikan Rp 5,000,000

  constructor(accountHolder: string, initialBalance: number = 0) {
    super(accountHolder, AccountType.SAVINGS, initialBalance);
  }

  // Override method abstract
  protected validateTransaction(amount: number): boolean {
    if (this.accountType === AccountType.SAVINGS) {
      // Validasi khusus untuk tabungan
      if (amount > this.WITHDRAWAL_LIMIT) {
        console.log(
          `❌ Jumlah melebihi limit harian: Rp ${this.WITHDRAWAL_LIMIT.toLocaleString()}`
        );
        return false;
      }
    }
    return true;
  }

  protected getTransactionFee(amount: number): number {
    // Tabungan tidak ada fee untuk transaksi di bawah 1 juta
    return amount >= 1000000 ? 5000 : 0;
  }

  // Method khusus untuk tabungan
  public checkMinimumBalance(): boolean {
    return this.balance >= this.MINIMUM_BALANCE;
  }

  // Override withdraw untuk validasi saldo minimum
  public withdraw(amount: number, description: string = "Withdrawal"): boolean {
    const fee = this.getTransactionFee(amount);
    const totalAmount = amount + fee;

    // Cek saldo minimum setelah penarikan
    if (this.balance - totalAmount < this.MINIMUM_BALANCE) {
      console.log(
        `❌ Penarikan gagal: Saldo tidak boleh kurang dari Rp ${this.MINIMUM_BALANCE.toLocaleString()}`
      );
      console.log(`💰 Saldo saat ini: Rp ${this.balance.toLocaleString()}`);
      console.log(
        `💸 Setelah penarikan: Rp ${(
          this.balance - totalAmount
        ).toLocaleString()}`
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

class CheckingAccount extends Account {
  private readonly OVERDRAFT_LIMIT = 1000000; // Overdraft Rp 1,000,000

  constructor(accountHolder: string, initialBalance: number = 0) {
    super(accountHolder, AccountType.CHECKING, initialBalance);
  }

  // Override method abstract
  protected validateTransaction(amount: number): boolean {
    // Giro bisa negatif sampai overdraft limit
    return true;
  }

  protected getTransactionFee(amount: number): number {
    // Giro ada fee 2500 per transaksi
    return 2500;
  }

  // Override withdraw untuk support overdraft
  public withdraw(amount: number, description: string = "Withdrawal"): boolean {
    const fee = this.getTransactionFee(amount);
    const totalAmount = amount + fee;

    // Cek overdraft limit
    if (this.balance - totalAmount < -this.OVERDRAFT_LIMIT) {
      console.log(
        `❌ Penarikan melebihi batas overdraft: Rp ${this.OVERDRAFT_LIMIT.toLocaleString()}`
      );
      console.log(`💰 Saldo saat ini: Rp ${this.balance.toLocaleString()}`);
      console.log(
        `💸 Setelah penarikan: Rp ${(
          this.balance - totalAmount
        ).toLocaleString()}`
      );
      this.addTransaction(
        TransactionType.WITHDRAWAL,
        amount,
        TransactionStatus.FAILED,
        "Overdraft limit exceeded"
      );
      return false;
    }

    // Validasi input dan status akun
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

    // Proses penarikan dengan overdraft
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

  // Method khusus untuk giro
  public getOverdraftStatus(): {
    inOverdraft: boolean;
    overdraftAmount: number;
    availableCredit: number;
  } {
    const inOverdraft = this.balance < 0;
    const overdraftAmount = inOverdraft ? Math.abs(this.balance) : 0;
    const availableCredit = this.OVERDRAFT_LIMIT - overdraftAmount;

    return {
      inOverdraft,
      overdraftAmount,
      availableCredit,
    };
  }
}

class PremiumAccount extends Account {
  private readonly MINIMUM_BALANCE = 10000000; // Minimum Rp 10,000,000
  private rewardPoints: number = 0;

  constructor(accountHolder: string, initialBalance: number = 0) {
    super(accountHolder, AccountType.PREMIUM, initialBalance);
  }

  protected validateTransaction(amount: number): boolean {
    // Premium account tidak ada limit
    return true;
  }

  protected getTransactionFee(amount: number): number {
    // Premium account bebas biaya
    return 0;
  }

  // Override untuk menambah reward points
  public deposit(amount: number, description: string = "Deposit"): boolean {
    const success = super.deposit(amount, description);
    if (success) {
      // Dapat 1 poin per 10,000 deposit
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

  public getRewardPoints(): number {
    return this.rewardPoints;
  }

  // Method khusus premium
  public redeemRewards(points: number): boolean {
    if (points > this.rewardPoints) {
      console.log("❌ Reward points tidak mencukupi");
      return false;
    }

    const cashback = points * 100; // 1 point = Rp 100
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

class BankingSystem {
  private accounts: Map<string, Account> = new Map();

  // Method untuk membuat akun baru
  public createAccount(
    accountHolder: string,
    accountType: AccountType,
    initialBalance: number = 0
  ): Account {
    let account: Account;

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

  // Method untuk mencari akun
  public findAccount(accountNumber: string): Account | undefined {
    return this.accounts.get(accountNumber);
  }

  // Method untuk transfer antar akun dengan nomor rekening
  public transferBetweenAccounts(
    fromAccountNumber: string,
    toAccountNumber: string,
    amount: number,
    description?: string
  ): boolean {
    const fromAccount = this.findAccount(fromAccountNumber);
    const toAccount = this.findAccount(toAccountNumber);

    if (!fromAccount) {
      console.log("❌ Akun pengirim tidak ditemukan");
      return false;
    }

    if (!toAccount) {
      console.log("❌ Akun penerima tidak ditemukan");
      return false;
    }

    return fromAccount.transferTo(toAccount, amount, description);
  }

  // Method untuk menampilkan semua akun
  public displayAllAccounts(): void {
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

// DEMO PENGGUNAAN
// ========================================
function demonstrateBankingSystem(): void {
  console.log("🏦 SISTEM PERBANKAN SEDERHANA - DEMO");
  console.log("=".repeat(80));

  // Buat instance banking system
  const bank = new BankingSystem();

  // Buat berbagai jenis akun
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

  // Tampilkan info akun
  console.log("\n📋 INFORMASI AKUN");
  tabunganBudi.displayAccountInfo();
  giroSari.displayAccountInfo();
  premiumAhmad.displayAccountInfo();

  // Test deposit
  console.log("\n💰 TEST DEPOSIT");
  tabunganBudi.deposit(250000, "Setoran gaji");
  giroSari.deposit(1000000, "Modal usaha");
  premiumAhmad.deposit(5000000, "Investasi");

  // Test withdrawal
  console.log("\n💸 TEST PENARIKAN");
  tabunganBudi.withdraw(50000, "Belanja bulanan");
  giroSari.withdraw(1200000, "Bayar supplier"); // Test overdraft
  premiumAhmad.withdraw(2000000, "Pembelian aset");

  // Test transfer
  console.log("\n🔄 TEST TRANSFER");
  tabunganBudi.transferTo(giroSari, 100000, "Transfer ke Sari");
  premiumAhmad.transferTo(tabunganBudi, 500000, "Bantuan usaha");

  // Test fitur khusus Premium
  console.log("\n🎁 TEST FITUR PREMIUM");
  if (premiumAhmad instanceof PremiumAccount) {
    console.log(`Current reward points: ${premiumAhmad.getRewardPoints()}`);
    premiumAhmad.redeemRewards(1800); // Redeem some points
  }

  // Test fitur khusus Checking (overdraft status)
  console.log("\n💳 TEST STATUS OVERDRAFT");
  if (giroSari instanceof CheckingAccount) {
    const overdraftStatus = giroSari.getOverdraftStatus();
    console.log("Status Overdraft:", overdraftStatus);
  }

  // Tampilkan history transaksi
  console.log("\n📊 RIWAYAT TRANSAKSI");
  tabunganBudi.displayTransactionHistory(5);
  giroSari.displayTransactionHistory(5);

  // Tampilkan semua akun
  bank.displayAllAccounts();

  // Test error cases
  console.log("\n❌ TEST ERROR HANDLING");
  tabunganBudi.withdraw(-50000); // Invalid amount
  tabunganBudi.withdraw(999999999); // Insufficient balance
  const nonExistentAccount = bank.findAccount("123456");
  if (!nonExistentAccount) {
    console.log("✅ Validasi akun tidak ditemukan berhasil");
  }
}

// Jalankan demo
demonstrateBankingSystem();

export {
  Account,
  SavingsAccount,
  CheckingAccount,
  PremiumAccount,
  Transaction,
  BankingSystem,
  AccountType,
  TransactionType,
  TransactionStatus,
};
