import { useState, useEffect } from 'react';
import { api } from '../../../../api/api';
import styles from './management.module.scss';

const PropertiesManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.properties.getAllProperties({ includeInactive: true });
      const propertiesData = response.data?.data || response.data || [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки объектов:', error);
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    if (filter === 'all') return true;
    if (filter === 'rent') return property.category === 'rent';
    if (filter === 'sale') return property.category === 'sale';
    if (filter === 'active') return property.status === 'active';
    if (filter === 'inactive') return property.status === 'inactive';
    return true;
  });

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await api.properties.changePropertyStatus(propertyId, newStatus);
      setProperties(prev => prev.map(prop => 
        prop.id === propertyId ? { ...prop, status: newStatus } : prop
      ));
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  const getTypeText = (type) => {
    const typeMap = {
      'apartment': 'Квартира',
      'commercial': 'Коммерческая',
      'house': 'Дом',
      'room': 'Комната'
    };
    return typeMap[type] || type;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Активен',
      'inactive': 'Неактивен',
      'rented': 'Сдан',
      'sold': 'Продан'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className={styles.loadingSection}>Загрузка объектов...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>🏠 Управление объектами недвижимости</h2>
        <div className={styles.sectionStats}>
          <span className={styles.stat}>
            Всего: {properties.length}
          </span>
          <span className={styles.stat}>
            Активных: {properties.filter(p => p.status === 'active').length}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Все объекты
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'rent' ? styles.active : ''}`}
          onClick={() => setFilter('rent')}
        >
          Для аренды
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'sale' ? styles.active : ''}`}
          onClick={() => setFilter('sale')}
        >
          Для продажи
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          Активные
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'inactive' ? styles.active : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Неактивные
        </button>
      </div>

      <div className={styles.propertiesGrid}>
        {filteredProperties.map(property => (
          <div key={property.id} className={styles.propertyCard}>
            <div className={styles.propertyImage}>
              {property.images && property.images.length > 0 ? (
                <img src={property.images[0]} alt={property.title} />
              ) : (
                <div className={styles.noImage}>
                  <span>🏠</span>
                  <p>Нет изображения</p>
                </div>
              )}
              <div className={styles.propertyBadges}>
                <span className={`${styles.typeBadge} ${styles[property.type]}`}>
                  {getTypeText(property.type)}
                </span>
                <span className={`${styles.categoryBadge} ${styles[property.category]}`}>
                  {property.category === 'rent' ? 'Аренда' : 'Продажа'}
                </span>
              </div>
            </div>
            
            <div className={styles.propertyInfo}>
              <h3>{property.title}</h3>
              <p className={styles.propertyAddress}>{property.address}</p>
              
              <div className={styles.propertyDetails}>
                <div className={styles.detailItem}>
                  <span>Комнат:</span>
                  <strong>{property.rooms}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Площадь:</span>
                  <strong>{property.area} м²</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Статус:</span>
                  <span className={`${styles.statusBadge} ${styles[property.status]}`}>
                    {getStatusText(property.status)}
                  </span>
                </div>
              </div>

              <div className={styles.propertyPrices}>
                {property.rentPrice && (
                  <div className={styles.priceItem}>
                    <span>Аренда:</span>
                    <strong className={styles.rentPrice}>
                      {property.rentPrice.toLocaleString()} ₽/мес
                    </strong>
                  </div>
                )}
                {property.price && (
                  <div className={styles.priceItem}>
                    <span>Продажа:</span>
                    <strong className={styles.salePrice}>
                      {property.price.toLocaleString()} ₽
                    </strong>
                  </div>
                )}
              </div>

              {property.description && (
                <p className={styles.propertyDescription}>
                  {property.description.length > 100 
                    ? `${property.description.substring(0, 100)}...` 
                    : property.description
                  }
                </p>
              )}
            </div>

            <div className={styles.propertyActions}>
              {property.status === 'active' ? (
                <button 
                  className={styles.deactivateBtn}
                  onClick={() => handleStatusChange(property.id, 'inactive')}
                >
                  Деактивировать
                </button>
              ) : (
                <button 
                  className={styles.activateBtn}
                  onClick={() => handleStatusChange(property.id, 'active')}
                >
                  Активировать
                </button>
              )}
              <button className={styles.editBtn}>
                ✏️ Редактировать
              </button>
              <button 
                className={styles.detailsBtn}
                onClick={() => setSelectedProperty(selectedProperty?.id === property.id ? null : property)}
              >
                {selectedProperty?.id === property.id ? '▲' : '▼'} Подробнее
              </button>
            </div>

            {selectedProperty?.id === property.id && (
              <div className={styles.propertyAdditionalInfo}>
                <div className={styles.additionalSection}>
                  <h4>Удобства:</h4>
                  <div className={styles.amenities}>
                    {property.amenities && property.amenities.length > 0 ? (
                      property.amenities.map((amenity, index) => (
                        <span key={index} className={styles.amenity}>
                          {amenity}
                        </span>
                      ))
                    ) : (
                      <p>Удобства не указаны</p>
                    )}
                  </div>
                </div>
                <div className={styles.additionalSection}>
                  <h4>Дата создания:</h4>
                  <p>{new Date(property.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className={styles.additionalSection}>
                  <h4>Последнее обновление:</h4>
                  <p>{new Date(property.updatedAt).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className={styles.emptyState}>
          <p>Объекты не найдены</p>
        </div>
      )}
    </div>
  );
};

export default PropertiesManagement;