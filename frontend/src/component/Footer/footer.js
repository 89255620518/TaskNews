import styles from './footer.module.scss';
import logo from '../../image/logo.1.png';
import { Link } from 'react-router-dom';
import banks from '../../image/HorizontalLogos.png';
import vkIcon from '../../image/vk.svg';
import rutube from '../../image/rutube.svg';
import frantsuzClub from "../../image/img2.png";
import academiya from "../../image/img3.png";
import wetop from "../../image/img4.png";
import comicadze from "../../image/img5.png";
import tyteda from "../../image/img6.png";
import shop from "../../image/img7.png";
import corpPit from "../../image/img8.png";
import dostavkaPom from "../../image/dostavkaPom.png";
import reiting from "../../image/img11.png";
import poyu from "../../image/img9.png";
import shashlandia from "../../image/img1.png";
import telegram from "../../image/telegram.svg";

const Footer = ({ contactsRef }) => {
    const projects = [
        { src: frantsuzClub, link: "https://frantsuz-club.ru/", name: "Французский клуб" },
        { src: dostavkaPom, link: "https://dostavka-pominki.ru/", name: "Доставка поминки" },
        { src: corpPit, link: "https://corp-pitanie.tyteda.ru/", name: "Корпоративное питание" },
        { src: shashlandia, link: "https://shashlandia.ru/", name: "Шашландия" },
        { src: shop, link: "http://frantsuz-shop.ru/", name: "Француз-Шоп", specialStyle: true },
        { src: comicadze, link: "https://comicadze.ru/", name: "Comicadze" },
        { src: tyteda, link: "https://tyteda.ru/", name: "Тытеда", specialStyle: true },
        { src: poyu, link: "https://poyuvsegda.ru", name: "ПоЮ Всегда" },
        { src: reiting, link: "https://reiting.moscow/", name: "Рейтинг Москва" },
        { src: academiya, link: "https://frantsuz.ru/", name: "Академия Француз" },
        { src: wetop, link: "https://wetop.ru/", name: "WeTop" },
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.logoSection}>
                        <Link to='/' className={styles.logoContainer}>
                            <img src={logo} alt='Логотип Дали-Хинкали' className={styles.logo} />
                        </Link>

                        <div className={styles.paymentButtons}>
                            <Link to="/payInfo" className={styles.button}>Правила оплаты</Link>
                            <Link to="/pay" className={styles.button}>Оплата</Link>
                            <Link to="/vozvrat" className={styles.button}>Возврат</Link>
                        </div>

                        <div className={styles.banks}>
                            <img src={banks} alt='Принимаемые платежные системы' className={styles.banksImage} />
                        </div>
                    </div>

                    <div className={styles.contactsSection}>
                        <div className={styles.contacts} ref={contactsRef}>
                            <h2 className={styles.sectionTitle}>Контакты</h2>
                            <div className={styles.contactInfo}>
                                <p>Режим работы:<br />с 11:00 до 23:00<br />ежедневно без выходных</p>
                                <p>ул. Ленина, 36А, Орехово-Зуево, Московская обл.</p>
                                <a href="mailto:info@dali-khinkali.ru" className={styles.link}>info@dali-khinkali.ru</a>
                                <a href="tel:+79680915551" className={styles.link}>+7 (968) 091-55-51</a>
                                <a href="tel:+79680915552" className={styles.link}>+7 (968) 091-55-52</a>

                                <div className={styles.socialLinks}>
                                    <a href="https://vk.com/dali_hinkali/" target="_blank" rel="noreferrer" className={styles.socialIcon}>
                                        <img src={vkIcon} alt="VK" />
                                    </a>
                                    <a href="https://rutube.ru/channel/60860525/" target="_blank" rel="noreferrer" className={styles.socialIcon}>
                                        <img src={rutube} alt="Rutube" />
                                    </a>

                                    <a className={styles.socialIcon} href="https://t.me/dali_hinkali/" target="_blank" rel="noreferrer">
                                        <img src={telegram} alt="svg" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className={styles.projects}>
                            <h2 className={styles.sectionTitle}>Наши проекты</h2>
                            <div className={styles.projectsGrid}>
                                {projects.map((project, index) => (
                                    <a
                                        key={index}
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${styles.projectLink} ${project.specialStyle ? styles.specialPadding : ''
                                            }`}
                                        title={project.name}
                                    >
                                        <div className={styles.imageContainer}>
                                            <img
                                                src={project.src}
                                                alt={project.name}
                                                className={styles.projectImage}
                                                loading="lazy"
                                            />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <p className={styles.copyrightText}>ИП Авалян В.Г <span>ИНН: 502807103555</span></p>

                    <div className={styles.legalLinks}>
                        <Link to="/policy" className={styles.legalLink}>Политика конфиденциальности</Link>
                        <p className={styles.copyrightText}>©Все права защищены</p>
                        <p className={styles.copyrightText}>Не является публичной офертой</p>
                        <p className={styles.copyrightText}>Сделано WeTop digital agency 2025</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;