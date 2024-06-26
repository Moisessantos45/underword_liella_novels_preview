import db_firebase from "../firebase/auth_firebase.js";
import obtener_informacion from "../helpers/obtener_data.js";

const obtenerCapitulo = async (req, res) => {
  const { clave } = req.params;
  try {
    const capitulos_data = await db_firebase
      .collection("Capitulos")
      .where("clave", "==", clave)
      .get();
    const capitulos = obtener_informacion(capitulos_data);
    res.status(202).json(capitulos);
  } catch (error) {
    res.status(404).json({ msg: "Ocurrio un error" });
  }
};

const obtenerCapituloNum = async (req, res) => {
  const { clave, capitulo } = req.params;
  // console.log(clave, capitulo)
  try {
    const [chapters, capitulos] = await Promise.all([
      db_firebase.collection("Capitulos").where("clave", "==", clave).get(),
      db_firebase
        .collection("Capitulos")
        .where("clave", "==", clave)
        .where("capitulo", "==", Number(capitulo))
        .get(),
    ]);

    const cont = chapters.docs.length;
    if (capitulo > cont)
      return res.status(404).json({ msg: "capitulo inexistente" });
    const data = obtener_informacion(capitulos)[0];
    res.status(202).json({ data, cont });
  } catch (error) {
    res.status(404).json({ msg: "No se encontro capitulo" });
  }
};

export { obtenerCapitulo, obtenerCapituloNum };
