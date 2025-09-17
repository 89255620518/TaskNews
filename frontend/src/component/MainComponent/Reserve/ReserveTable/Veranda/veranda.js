import React from "react";
import styles from "./veranda.module.css";
import Stol_10_13 from "../../img/stolBol.png";
import Stol_6__9__1__5 from "../../img/stolMal.png";
import closedImg from '../../img/closed.svg';

export default function Veranda({ closeModal, handler }) {
  const inHandlerVeranda = {
    t1: () => {
      handler("1");
      closeModal();
    },
    t2: () => {
      handler("2");
      closeModal();
    },
    t3: () => {
      handler("3");
      closeModal();
    },
    t4: () => {
      handler("4");
      closeModal();
    },
    t5: () => {
      handler("5");
      closeModal();
    },
    t6: () => {
      handler("6");
      closeModal();
    },
    t7: () => {
      handler("7");
      closeModal();
    },
    t8: () => {
      handler("8");
      closeModal();
    },
    t9: () => {
      handler("9");
      closeModal();
    },
    t10: () => {
      handler("10");
      closeModal();
    },
    t11: () => {
      handler("11");
      closeModal();
    },
    t12: () => {
      handler("12");
      closeModal();
    },
    t13: () => {
      handler("13");
      closeModal();
    },
    t14: () => {
      handler("14");
      closeModal();
    },
  };

  return (
    <div className={styles.PagesModalVeranda}>
      <div className={styles.reserveVeranda}>
        <img onClick={closeModal} className={styles.closedModal} src={closedImg} alt="closev" />
        <div className={styles.reserveVerandaContaienr}>
          {/* Столы от 11 до 14 */}
          <div className={styles.reserveVerandaColumn_10__13}>
            <div
              className={styles.reserveVerandaRow + " " + styles.table__11}
              onClick={() => inHandlerVeranda["t11"]()}
            >
              <img src={Stol_10_13} alt="" />
              <p className={styles.reserveVerandaText}>Стол №11</p>
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__12}
              onClick={() => inHandlerVeranda["t12"]()}
            >
              <img src={Stol_10_13} alt="" />
              <p className={styles.reserveVerandaText}>Стол №12</p>
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__13}
              onClick={() => inHandlerVeranda["t13"]()}
            >
              <img src={Stol_10_13} alt="" />
              <p className={styles.reserveVerandaText}>Стол №13</p>
            </div>
            <div
              className={styles.reserveVerandaRow + " " + styles.table__14}
              onClick={() => inHandlerVeranda["t14"]()}
            >
              <img src={Stol_10_13} alt="" />
              <p className={styles.reserveVerandaText}>Стол №14</p>
            </div>
          </div>
          {/* Столы от 6 до 9 */}
          <div className={styles.reserveVerandaColumn_6__9}>
            <div
              className={styles.reserveVerandaRow + " " + styles.table__6}
              onClick={() => inHandlerVeranda["t6"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №6</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__7}
              onClick={() => inHandlerVeranda["t7"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №7</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__8}
              onClick={() => inHandlerVeranda["t8"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №8</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__9}
              onClick={() => inHandlerVeranda["t9"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №9</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>
            <div
              className={styles.reserveVerandaRow + " " + styles.table__10}
              onClick={() => inHandlerVeranda["t10"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №10</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>
          </div>
          {/* Столы от 1 до 5 */}
          <div className={styles.reserveVerandaRow__1__5}>
            <div
              className={styles.reserveVerandaRow + " " + styles.table__1}
              onClick={() => inHandlerVeranda["t1"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №1</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__2}
              onClick={() => inHandlerVeranda["t2"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №2</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__3}
              onClick={() => inHandlerVeranda["t3"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №3</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__4}
              onClick={() => inHandlerVeranda["t4"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №4</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>

            <div
              className={styles.reserveVerandaRow + " " + styles.table__5}
              onClick={() => inHandlerVeranda["t5"]()}
            >
              <p className={styles.reserveVerandaText}>Стол №5</p>
              <img src={Stol_6__9__1__5} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}