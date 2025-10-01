import { apiPharma } from "../api/apiPharma";
import React from "react";

export const useDashboard = () => {

    const getAllMedcaments =  async () =>{

        try{
            const res = await apiPharma.get("medicamentos/all");
            console.log("Respuesta medicamentos:",res.data);
        } catch(error){
            console.error("Error al obtener medicamentos:",error);
        }

    }

}