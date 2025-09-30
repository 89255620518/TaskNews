import { useState } from 'react';
import styles from '../../admin.module.scss';

const EditPropertyModal = ({ property, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    type: property?.type || 'apartment',
    status: property?.status || 'active',
    category: property?.category || 'rent',
    price: property?.price || 0,
    rentPrice: property?.rentPrice || 0,
    area: property?.area || 0,
    rooms: property?.rooms || 0,
    address: property?.address || '',
    amenities: property?.amenities || [],
    images: property?.images || []
  });

  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [imagesInput, setImagesInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      price: Number(formData.price),
      rentPrice: formData.rentPrice ? Number(formData.rentPrice) : undefined,
      area: Number(formData.area),
      rooms: formData.rooms ? Number(formData.rooms) : undefined
    };
    
    onSave(processedData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNumberChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value ? Number(e.target.value) : 0
    });
  };

  const handleAmenitiesAdd = () => {
    if (amenitiesInput.trim()) {
      const newAmenities = [...formData.amenities, amenitiesInput.trim()];
      setFormData({
        ...formData,
        amenities: newAmenities
      });
      setAmenitiesInput('');
    }
  };

  const handleAmenitiesRemove = (index) => {
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      amenities: newAmenities
    });
  };

  const handleImagesAdd = () => {
    if (imagesInput.trim()) {
      const newImages = [...formData.images, imagesInput.trim()];
      setFormData({
        ...formData,
        images: newImages
      });
      setImagesInput('');
    }
  };

  const handleImagesRemove = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const parsePrice = (priceString) => {
    return priceString.replace(/\s/g, '');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {property ? 'Редактирование объекта' : 'Создание объекта'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Название объекта *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={styles.formInput}
              placeholder="Например: 3-комнатная квартира в центре"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={styles.formTextarea}
              rows="3"
              placeholder="Подробное описание объекта..."
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Тип объекта *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="apartment">Квартира</option>
                <option value="house">Дом</option>
                <option value="commercial">Коммерческая недвижимость</option>
                <option value="land">Земельный участок</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Статус *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="active">Доступен</option>
                <option value="rented">Арендован</option>
                <option value="sold">Продан</option>
                <option value="maintenance">На обслуживании</option>
                <option value="inactive">Неактивен</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Тип сделки *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.formSelect}
            >
              <option value="rent">Аренда</option>
              <option value="sale">Продажа</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>
                {formData.category === 'rent' ? 'Цена аренды (₽/мес) *' : 'Цена продажи (₽) *'}
              </label>
              <input
                type="text"
                name={formData.category === 'rent' ? 'rentPrice' : 'price'}
                value={formatPrice(formData.category === 'rent' ? formData.rentPrice : formData.price)}
                onChange={(e) => {
                  const value = parsePrice(e.target.value);
                  setFormData({
                    ...formData,
                    [formData.category === 'rent' ? 'rentPrice' : 'price']: value ? Number(value) : 0
                  });
                }}
                required
                className={styles.formInput}
                placeholder={formData.category === 'rent' ? '30000' : '1000000'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Площадь (м²) *</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleNumberChange}
                required
                className={styles.formInput}
                min="1"
                step="0.1"
              />
            </div>
          </div>

          {(formData.type === 'apartment' || formData.type === 'house') && (
            <div className={styles.formGroup}>
              <label>Количество комнат</label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleNumberChange}
                className={styles.formInput}
                min="1"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Адрес *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className={styles.formInput}
              placeholder="ул. Примерная, д. 123, Москва"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Удобства</label>
            <div className={styles.arrayInput}>
              <div className={styles.arrayInputRow}>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className={styles.arrayInputField}
                  placeholder="Добавить удобство (Wi-Fi, Кондиционер, и т.д.)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAmenitiesAdd();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.arrayAddButton}
                  onClick={handleAmenitiesAdd}
                >
                  +
                </button>
              </div>
              <div className={styles.arrayItems}>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className={styles.arrayItem}>
                    <span>{amenity}</span>
                    <button
                      type="button"
                      className={styles.arrayRemoveButton}
                      onClick={() => handleAmenitiesRemove(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Ссылки на изображения</label>
            <div className={styles.arrayInput}>
              <div className={styles.arrayInputRow}>
                <input
                  type="text"
                  value={imagesInput}
                  onChange={(e) => setImagesInput(e.target.value)}
                  className={styles.arrayInputField}
                  placeholder="https://example.com/image.jpg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleImagesAdd();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.arrayAddButton}
                  onClick={handleImagesAdd}
                >
                  +
                </button>
              </div>
              <div className={styles.arrayItems}>
                {formData.images.map((image, index) => (
                  <div key={index} className={styles.arrayItem}>
                    <span className={styles.urlText}>{image}</span>
                    <button
                      type="button"
                      className={styles.arrayRemoveButton}
                      onClick={() => handleImagesRemove(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.saveButton}
            >
              {property ? 'Сохранить изменения' : 'Создать объект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyModal;