import MenuComponent from "../component/MenuComponent/menuComponent";
import { Helmet } from "react-helmet";

const MenuPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали/Основное меню</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <MenuComponent />
        </div>
    )
}

export default MenuPage;