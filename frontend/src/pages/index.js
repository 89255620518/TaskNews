import { Helmet } from "react-helmet";
import BannerComponent from "../component/MainComponent/Banner/banner";
import SubMenuComponent from "../component/MainComponent/SubMenu/subMenu";
import ReserveTable from "../component/MainComponent/Reserve/ReserveTable/reserveTable";
import DeliveryComponent from "../component/MainComponent/Delivery/deliveryComponent";
import DeliveryRulesComponent from "../component/MainComponent/DeliveryRules/deliveryRules";
import ReserveHall from "../component/MainComponent/Reserve/ReserveHall/reserveHall";
import TaxiComponent from "../component/MainComponent/TaxiComponent/taxiComponent";
import { useEffect } from 'react';

const HomePage = ({
    tableRef,
    hallRef,
    taxiRef,
    deliveryRef
}) => {

    useEffect(() => {
        // Проверяем параметры URL после монтирования компонента
        const searchParams = new URLSearchParams(window.location.search);
        const section = searchParams.get('section');
        
        // Определяем соответствующий ref в зависимости от значения section
        let targetRef;
        if (section === 'reserve') targetRef = tableRef;
        else if (section === 'hall') targetRef = hallRef;
        else if (section === 'taxi') targetRef = taxiRef;
        
        // Если ref существует и он привязан к элементу, скроллим к нему
        if (targetRef && targetRef.current) {
            targetRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [tableRef, hallRef, taxiRef]);

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Дали-Хинкали кафе грузинской кухни с летней верандой</title>
                <meta name="description" content="В Дали-Хинкали бесплатная доставка по Орехово-Зуевскому району" />
                <meta name="yandex-verification" content="c2e397d2d61662dc" />
            </Helmet>
            <BannerComponent />
            <SubMenuComponent />
            <ReserveTable tableRef={tableRef} />
            <DeliveryComponent deliveryRef={deliveryRef} />
            <DeliveryRulesComponent />
            <ReserveHall hallRef={hallRef} />
            <TaxiComponent taxiRef={taxiRef} />
        </div>
    )
}

export default HomePage;