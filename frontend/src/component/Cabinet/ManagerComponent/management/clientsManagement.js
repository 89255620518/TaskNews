import { useState, useEffect } from 'react';
import { api } from '../../../../api/api';
import styles from './management.module.scss';

const ClientsManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.users.getAll();
      const allUsers = response.data?.users || response.data || [];
      const clientUsers = allUsers.filter(user => user.role === 'user');
      setClients(clientUsers);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phoneNumber && client.phoneNumber.includes(searchTerm))
  );

  const handleContact = (client, method) => {
    if (method === 'phone' && client.phoneNumber) {
      window.open(`tel:${client.phoneNumber}`);
    } else if (method === 'email' && client.email) {
      window.open(`mailto:${client.email}`);
    }
  };

  if (loading) {
    return <div className={styles.loadingSection}>Загрузка клиентов...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>👥 Управление клиентами</h2>
        <div className={styles.sectionStats}>
          <span className={styles.stat}>
            Всего клиентов: {clients.length}
          </span>
        </div>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Поиск клиентов по имени, email или телефону..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.clientsGrid}>
        {filteredClients.map(client => (
          <div key={client.id} className={styles.clientCard}>
            <div className={styles.clientHeader}>
              <div className={styles.clientAvatar}>
                {(client.firstName?.[0] || '') + (client.lastName?.[0] || '')}
              </div>
              <div className={styles.clientMainInfo}>
                <h3>{client.firstName} {client.lastName}</h3>
                <p className={styles.clientEmail}>{client.email}</p>
              </div>
            </div>
            
            <div className={styles.clientDetails}>
              {client.phoneNumber && (
                <p><strong>Телефон:</strong> {client.phoneNumber}</p>
              )}
              <p><strong>Зарегистрирован:</strong> {new Date(client.createdAt).toLocaleDateString('ru-RU')}</p>
              {client.lastLogin && (
                <p><strong>Последний вход:</strong> {new Date(client.lastLogin).toLocaleDateString('ru-RU')}</p>
              )}
            </div>

            <div className={styles.clientActions}>
              {client.phoneNumber && (
                <button 
                  className={styles.contactBtn}
                  onClick={() => handleContact(client, 'phone')}
                >
                  📞 Позвонить
                </button>
              )}
              <button 
                className={styles.messageBtn}
                onClick={() => handleContact(client, 'email')}
              >
                ✉️ Написать
              </button>
              <button 
                className={styles.detailsBtn}
                onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
              >
                {selectedClient?.id === client.id ? '▲' : '▼'} Подробнее
              </button>
            </div>

            {selectedClient?.id === client.id && (
              <div className={styles.clientAdditionalInfo}>
                <div className={styles.additionalSection}>
                  <h4>Активные аренды:</h4>
                  <p>2 объекта</p>
                </div>
                <div className={styles.additionalSection}>
                  <h4>История заявок:</h4>
                  <p>5 заявок, 3 одобрено</p>
                </div>
                <div className={styles.additionalSection}>
                  <h4>Примечания:</h4>
                  <textarea 
                    placeholder="Добавьте заметки о клиенте..."
                    className={styles.notesTextarea}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className={styles.emptyState}>
          <p>Клиенты не найдены</p>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;