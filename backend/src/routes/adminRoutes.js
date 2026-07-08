const router = require("express").Router();
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");
const { Empresa, Usuario } = require("../models");
const { enviarCorreo } = require("../services/aws/ses");

router.use(requiereAutenticacion, requiereRol("administrador"));

// RF-A06: listar empresas pendientes de validación
router.get("/empresas/pendientes", async (req, res) => {
  const empresas = await Empresa.findAll({
    where: { estatus_validacion: "pendiente" },
    include: [{ model: Usuario, attributes: ["correo"] }],
  });
  return res.json(empresas);
});

// RF-A07: aprobar o rechazar, con comentario obligatorio si se rechaza
router.put("/empresas/:id/validar", async (req, res) => {
  const { aprobar, motivo } = req.body;
  const empresa = await Empresa.findByPk(req.params.id, { include: [Usuario] });
  if (!empresa) return res.status(404).json({ error: "Empresa no encontrada" });

  if (!aprobar && !motivo) {
    return res.status(400).json({ error: "El motivo de rechazo es obligatorio" });
  }

  empresa.estatus_validacion = aprobar ? "aprobada" : "rechazada";
  empresa.motivo_rechazo = aprobar ? null : motivo;
  await empresa.save();

  // RF-EM04: notificar por correo el resultado de la validación
  await enviarCorreo({
    para: empresa.Usuario.correo,
    asunto: aprobar ? "Tu cuenta empresarial fue aprobada" : "Tu cuenta empresarial fue rechazada",
    texto: aprobar ? "Ya puedes publicar vacantes en PractiLink." : `Motivo: ${motivo}`,
  });

  // TODO (RF-A08): registrar en bitacora_auditoria quién validó y cuándo.
  return res.json(empresa);
});

module.exports = router;
