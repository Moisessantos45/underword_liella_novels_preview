import db_firebase from "../firebase/auth_firebase.js";
import obtener_informacion from "../helpers/obtener_data.js";

const busqueda = async (generosArray, clave) => {
  let datos = [];
  let { docs, empty } = await db_firebase
    .collection("Novelas")
    .where("clave", "!=", clave)
    .get();
  if (!empty) {
    datos = docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }
  const filter_geners = datos
    .filter((doc) => {
      let generosDoc = doc.generos.split(",").map((item) => item.trim());
      let cont = 0;
      generosArray.forEach((item) => {
        if (generosDoc.includes(item.trim())) {
          cont++;
        }
      });
      return cont >= 2 && cont <= 5;
    })
    .slice(0, 5);
  return filter_geners;
};

const contador_visitas = async () => {
  const visitas = await db_firebase
    .collection("Visitas")
    .doc("oc37sCt6ELD0UOl07X5T")
    .get();
  let cont = visitas.data().visistas;
  cont++;
  // console.log(cont)
  await db_firebase
    .collection("Visitas")
    .doc("oc37sCt6ELD0UOl07X5T")
    .update({ visistas: cont });
  return cont;
};

const obtenerNovelasInicio = async (req, res) => {
  try {
    const getNovels = await db_firebase.collection("Novelas").get();
    const novela = obtener_informacion(getNovels);
    await contador_visitas();
    // console.log(novela)
    res.status(202).json(novela);
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error de consulta" });
  }
};

const mostrarInfoNovela = async (req, res) => {
  const { clave } = req.params;

  try {
    const [data_novel, capi_data] = await Promise.all([
      db_firebase.collection("Novelas").where("clave", "==", clave).get(),
      db_firebase.collection("Capitulos").where("clave", "==", clave).get(),
    ]);
    const info = obtener_informacion(data_novel)[0];
    const capi = obtener_informacion(capi_data);
    res.status(202).json({ info, capi });
  } catch (error) {
    res.status(404).json({ msg: "ocurrio un error" });
  }
};

const getCard = async (req, res) => {
  const { clave } = req.params;
  try {
    const card_data = await db_firebase
      .collection("Volumenes")
      .where("clave", "==", clave)
      .get();
    const card = obtener_informacion(card_data).reverse();
    res.status(202).json(card);
  } catch (error) {
    res.status(404).json({ msg: "Ocurrio un error" });
  }
};

const getRecomendaciones = async (req, res) => {
  const { clave } = req.params;
  try {
    const data_novel = await db_firebase
      .collection("Novelas")
      .where("clave", "==", clave)
      .get();
    if (data_novel.empty)
      return res.status(400).json({ msg: "No existe la novela" });
    const info = obtener_informacion(data_novel)[0];
    const generosSearch = info.generos.split(",");
    const recomendaciones = await busqueda(generosSearch, clave);
    res.status(202).json(recomendaciones);
  } catch (error) {
    res.status(404).json({ msg: "Error de conexion" });
  }
};

export { obtenerNovelasInicio, mostrarInfoNovela, getCard, getRecomendaciones };
