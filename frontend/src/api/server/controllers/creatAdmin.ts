import { User } from "../models/User";

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createAdminUser = async () => {
  try {
    console.log('=== Создание администратора ===\n');
    
    const email = await question('Введите email администратора: ');
    const password = await question('Введите пароль (мин. 6 символов): ');
    const firstName = await question('Введите имя: ');
    const lastName = await question('Введите фамилию: ');
    const phoneNumber = await question('Введите номер телефона (опционально): ');

    if (!email || !password || !firstName || !lastName) {
      console.log('\n❌ Ошибка: Все поля кроме телефона обязательны для заполнения');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.log('\n❌ Ошибка: Пароль должен содержать минимум 6 символов');
      rl.close();
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('\n❌ Ошибка: Пользователь с таким email уже существует');
      rl.close();
      return;
    }

    const adminUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber: phoneNumber || '',
      role: 'admin' as const
    });

    console.log('\n✅ Администратор успешно создан!');
    console.log('📋 Данные администратора:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Имя: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Роль: ${adminUser.role}`);
    console.log(`   Телефон: ${adminUser.phoneNumber || 'не указан'}`);
    console.log(`   Дата создания: ${adminUser.createdAt}`);
    console.log('\n💡 Теперь вы можете использовать этого администратора для управления пользователями через API');

  } catch (error: any) {
    console.error('\n❌ Ошибка при создании администратора:', error.message);
  } finally {
    rl.close();
  }
};

const listAdmins = async () => {
  try {
    const { rows: users } = await User.findAndCountAll();
    const admins = users.filter(user => user.role === 'admin');
    
    console.log('\n=== Существующие администраторы ===');
    
    if (admins.length === 0) {
      console.log('Администраторы не найдены');
      return;
    }

    admins.forEach(admin => {
      console.log(`\n👤 Администратор #${admin.id}:`);
      console.log(`   Имя: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Телефон: ${admin.phoneNumber || 'не указан'}`);
      console.log(`   Создан: ${admin.createdAt}`);
    });

  } catch (error: any) {
    console.error('Ошибка при получении списка администраторов:', error.message);
  }
};

const deleteAdmin = async () => {
  try {
    const adminId = await question('\nВведите ID администратора для удаления: ');
    const id = parseInt(adminId);

    if (isNaN(id)) {
      console.log('❌ Ошибка: Введите корректный ID');
      return;
    }

    const admin = await User.findByPk(id);
    
    if (!admin) {
      console.log('❌ Администратор с таким ID не найден');
      return;
    }

    if (admin.role !== 'admin') {
      console.log('❌ Пользователь не является администратором');
      return;
    }

    const confirm = await question(`Вы уверены, что хотите удалить администратора ${admin.firstName} ${admin.lastName} (ID: ${admin.id})? (y/N): `);
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('Удаление отменено');
      return;
    }

    await admin.destroy();
    console.log('✅ Администратор успешно удален');

  } catch (error: any) {
    console.error('Ошибка при удалении администратора:', error.message);
  }
};

const showMenu = async () => {
  console.log('\n=== Управление администраторами ===');
  console.log('1. Создать нового администратора');
  console.log('2. Показать существующих администраторов');
  console.log('3. Удалить администратора');
  console.log('4. Выход');

  const choice = await question('\nВыберите действие (1-4): ');

  switch (choice) {
    case '1':
      await createAdminUser();
      break;
    case '2':
      await listAdmins();
      break;
    case '3':
      await deleteAdmin();
      break;
    case '4':
      console.log('Выход...');
      rl.close();
      return;
    default:
      console.log('❌ Неверный выбор');
  }

  if (choice !== '4') {
    const continueChoice = await question('\nПродолжить? (y/N): ');
    if (continueChoice.toLowerCase() === 'y') {
      await showMenu();
    } else {
      console.log('Выход...');
      rl.close();
    }
  }
};

if (require.main === module) {
  console.log('🚀 Скрипт управления администраторами');
  showMenu().catch(error => {
    console.error('Фатальная ошибка:', error);
    rl.close();
  });
}

rl.on('close', () => {
  console.log('\n👋 До свидания!');
  process.exit(0);
});

export { createAdminUser, listAdmins, deleteAdmin };