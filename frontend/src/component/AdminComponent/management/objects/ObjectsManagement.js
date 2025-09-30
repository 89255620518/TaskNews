import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../api/api';
import EditPropertyModal from './EditObjectModal';
import styles from '../../admin.module.scss';

const PropertiesManagement = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProperty, setEditingProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('all');
  const [stats, setStats] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.properties.getAllProperties();
      console.log('Properties response:', response);

      if (response && response.success) {
        const propertiesData = Array.isArray(response.data?.properties) ? response.data.properties : 
                              Array.isArray(response.properties) ? response.properties : 
                              Array.isArray(response.data) ? response.data : 
                              [];
        
        setProperties(propertiesData);
      } else {
        setError(response?.data?.message || response?.message || 'Не удалось загрузить объекты');
      }
    } catch (err) {
      console.error('Ошибка загрузки объектов:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки объектов');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.properties.getPropertiesStats();
      if (response && response.success) {
        setStats(response.data || response);
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, [fetchProperties, fetchStats]);

  useEffect(() => {
    switch (currentView) {
      case 'all':
        setFilteredProperties(properties);
        break;
      case 'available':
        setFilteredProperties(properties.filter(prop => prop.status === 'available' && prop.isActive));
        break;
      case 'rented':
        setFilteredProperties(properties.filter(prop => prop.status === 'rented'));
        break;
      case 'sold':
        setFilteredProperties(properties.filter(prop => prop.status === 'sold'));
        break;
      case 'maintenance':
        setFilteredProperties(properties.filter(prop => prop.status === 'maintenance'));
        break;
      case 'inactive':
        setFilteredProperties(properties.filter(prop => !prop.isActive));
        break;
      default:
        setFilteredProperties(properties);
    }
  }, [currentView, properties]);

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowModal(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот объект?')) {
      try {
        const response = await api.properties.deleteProperty(propertyId);
        
        if (response && response.success) {
          setProperties(prevProperties => prevProperties.filter(prop => prop.id !== propertyId));
          setError('');
          fetchStats();
        } else {
          setError(response?.data?.message || response?.message || 'Ошибка удаления объекта');
        }
      } catch (err) {
        console.error('Ошибка удаления:', err);
        setError(err.response?.data?.message || err.message || 'Ошибка удаления объекта');
      }
    }
  };

  const handleDestroyProperty = async (propertyId) => {
    if (window.confirm('ВНИМАНИЕ! Это действие полностью удалит объект из системы. Продолжить?')) {
      try {
        const response = await api.properties.destroyProperty(propertyId);
        
        if (response && response.success) {
          setProperties(prevProperties => prevProperties.filter(prop => prop.id !== propertyId));
          setError('');
          fetchStats();
        } else {
          setError(response?.data?.message || response?.message || 'Ошибка полного удаления объекта');
        }
      } catch (err) {
        console.error('Ошибка полного удаления:', err);
        setError(err.response?.data?.message || err.message || 'Ошибка полного удаления объекта');
      }
    }
  };

  const handleChangeStatus = async (propertyId, newStatus) => {
    try {
      const response = await api.properties.changePropertyStatus(propertyId, newStatus);
      
      if (response && response.success) {
        const updatedProperty = response.data || response;
        setProperties(prevProperties => 
          prevProperties.map(prop => 
            prop.id === propertyId ? {
              ...prop,
              status: updatedProperty.status || newStatus
            } : prop
          )
        );
        setError('');
        fetchStats();
      } else {
        setError(response?.data?.message || response?.message || 'Ошибка изменения статуса');
      }
    } catch (err) {
      console.error('Ошибка изменения статуса:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка изменения статуса');
    }
  };

  const handleRestoreProperty = async (propertyId) => {
    try {
      const response = await api.properties.restoreProperty(propertyId);
      
      if (response && response.success) {
        const updatedProperty = response.data || response;
        setProperties(prevProperties => 
          prevProperties.map(prop => 
            prop.id === propertyId ? {
              ...prop,
              isActive: true
            } : prop
          )
        );
        setError('');
        fetchStats();
      } else {
        setError(response?.data?.message || response?.message || 'Ошибка восстановления объекта');
      }
    } catch (err) {
      console.error('Ошибка восстановления:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка восстановления объекта');
    }
  };

  const handleSaveProperty = async (propertyData) => {
    try {
      if (editingProperty) {
        const response = await api.properties.updateProperty(editingProperty.id, propertyData);
        
        if (response && response.success) {
          const updatedProperty = response.data || response;
          setProperties(prevProperties => 
            prevProperties.map(prop => 
              prop.id === editingProperty.id ? {
                ...prop,
                ...updatedProperty,
                updatedAt: new Date().toISOString()
              } : prop
            )
          );
          setError('');
          fetchStats();
        } else {
          setError(response?.data?.message || response?.message || 'Ошибка сохранения объекта');
        }
      } else {
        const response = await api.properties.createProperty(propertyData);
        
        if (response && response.success) {
          const newProperty = response.data || response;
          setProperties(prevProperties => [...prevProperties, newProperty]);
          setError('');
          fetchStats();
        } else {
          setError(response?.data?.message || response?.message || 'Ошибка создания объекта');
        }
      }
      setShowModal(false);
      setEditingProperty(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка сохранения объекта');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'available': 'Доступен',
      'rented': 'Арендован',
      'sold': 'Продан',
      'maintenance': 'На обслуживании'
    };
    return statusMap[status] || status;
  };

  const getTypeDisplay = (type) => {
    const typeMap = {
      'apartment': 'Квартира',
      'house': 'Дом',
      'commercial': 'Коммерческая',
      'land': 'Земельный участок'
    };
    return typeMap[type] || type;
  };

  const getTransactionTypeDisplay = (type) => {
    const typeMap = {
      'rent': 'Аренда',
      'sale': 'Продажа',
      'both': 'Аренда/Продажа'
    };
    return typeMap[type] || type;
  };

  const propertyStats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'available' && p.isActive).length,
    rented: properties.filter(p => p.status === 'rented').length,
    sold: properties.filter(p => p.status === 'sold').length,
    maintenance: properties.filter(p => p.status === 'maintenance').length,
    inactive: properties.filter(p => !p.isActive).length,
    forRent: properties.filter(p => p.transactionType === 'rent').length,
    forSale: properties.filter(p => p.transactionType === 'sale').length,
    forBoth: properties.filter(p => p.transactionType === 'both').length
  };

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h2>🏠 Управление объектами недвижимости</h2>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{propertyStats.total}</span>
            <span className={styles.statLabel}>Всего объектов</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{propertyStats.available}</span>
            <span className={styles.statLabel}>Доступно</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{propertyStats.rented}</span>
            <span className={styles.statLabel}>Арендовано</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{propertyStats.sold}</span>
            <span className={styles.statLabel}>Продано</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{propertyStats.maintenance}</span>
            <span className={styles.statLabel}>Обслуживание</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{propertyStats.inactive}</span>
            <span className={styles.statLabel}>Неактивно</span>
          </div>
        </div>

        <div className={styles.sectionActions}>
          <button 
            className={styles.addButton}
            onClick={() => {
              setEditingProperty(null);
              setShowModal(true);
            }}
          >
            ➕ Добавить объект
          </button>
        </div>

        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterButton} ${currentView === 'all' ? styles.active : ''}`}
            onClick={() => setCurrentView('all')}
          >
            Все ({propertyStats.total})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'available' ? styles.active : ''}`}
            onClick={() => setCurrentView('available')}
          >
            Доступно ({propertyStats.available})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'rented' ? styles.active : ''}`}
            onClick={() => setCurrentView('rented')}
          >
            Арендовано ({propertyStats.rented})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'sold' ? styles.active : ''}`}
            onClick={() => setCurrentView('sold')}
          >
            Продано ({propertyStats.sold})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'maintenance' ? styles.active : ''}`}
            onClick={() => setCurrentView('maintenance')}
          >
            Обслуживание ({propertyStats.maintenance})
          </button>
          <button 
            className={`${styles.filterButton} ${currentView === 'inactive' ? styles.active : ''}`}
            onClick={() => setCurrentView('inactive')}
          >
            Неактивно ({propertyStats.inactive})
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button 
            onClick={() => setError('')} 
            className={styles.closeError}
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          Загрузка данных объектов...
        </div>
      )}

      {!loading && filteredProperties.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Статус</th>
                <th>Тип сделки</th>
                <th>Цена</th>
                <th>Площадь</th>
                <th>Город</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(property => (
                <tr key={property.id} className={styles.dataRow}>
                  <td>
                    <div className={styles.propertyTitle}>
                      {property.title}
                      {!property.isActive && <span className={styles.inactiveBadge}>Неактивно</span>}
                    </div>
                  </td>
                  <td>{getTypeDisplay(property.type)}</td>
                  <td>
                    <select
                      value={property.status}
                      onChange={(e) => handleChangeStatus(property.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="available">Доступен</option>
                      <option value="rented">Арендован</option>
                      <option value="sold">Продан</option>
                      <option value="maintenance">Обслуживание</option>
                    </select>
                  </td>
                  <td>{getTransactionTypeDisplay(property.transactionType)}</td>
                  <td>
                    {formatPrice(property.price)} ₽
                    {property.rentPrice && (
                      <div className={styles.rentPrice}>
                        {formatPrice(property.rentPrice)} ₽/мес
                      </div>
                    )}
                  </td>
                  <td>{property.area} м²</td>
                  <td>{property.city}</td>
                  <td>{formatDate(property.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => handleEditProperty(property)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      {property.isActive ? (
                        <button 
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDeleteProperty(property.id)}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      ) : (
                        <button 
                          className={`${styles.actionButton} ${styles.restoreButton}`}
                          onClick={() => handleRestoreProperty(property.id)}
                          title="Восстановить"
                        >
                          🔄
                        </button>
                      )}
                      <button 
                        className={`${styles.actionButton} ${styles.destroyButton}`}
                        onClick={() => handleDestroyProperty(property.id)}
                        title="Полное удаление"
                      >
                        💥
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredProperties.length === 0 && (
        <div className={styles.noData}>
          {currentView === 'all' ? 'Нет объектов недвижимости' : 
           currentView === 'available' ? 'Нет доступных объектов' :
           currentView === 'rented' ? 'Нет арендованных объектов' :
           currentView === 'sold' ? 'Нет проданных объектов' :
           currentView === 'maintenance' ? 'Нет объектов на обслуживании' : 
           'Нет неактивных объектов'}
        </div>
      )}

      {showModal && (
        <EditPropertyModal
          property={editingProperty}
          onSave={handleSaveProperty}
          onClose={() => {
            setShowModal(false);
            setEditingProperty(null);
            setError('');
          }}
          getTypeDisplay={getTypeDisplay}
          getStatusDisplay={getStatusDisplay}
          getTransactionTypeDisplay={getTransactionTypeDisplay}
        />
      )}
    </div>
  );
};

export default PropertiesManagement;