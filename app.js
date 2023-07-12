function calcularDias() {
    var fechaNacimiento = document.getElementById("fecha").value;
    var fechaActual = new Date();
    
    var fechaNacimientoArray = fechaNacimiento.split("-");
    var diaNacimiento = parseInt(fechaNacimientoArray[2]);
    var mesNacimiento = parseInt(fechaNacimientoArray[1]) - 1;
    var anioNacimiento = parseInt(fechaNacimientoArray[0]);
    console.log(diaNacimiento);
    console.log(mesNacimiento);
    console.log(anioNacimiento);
    var fechaNacimientoCompleta = new Date(anioNacimiento, mesNacimiento, diaNacimiento);
    console.log(fechaNacimiento);
    var resto = fechaActual - fechaNacimientoCompleta;
    console.log(resto);

    var dias = Math.floor((resto) / (1000 * 60 * 60 * 24)); // Calculamos la diferencia en días
    if (!isNaN(dias)){
        document.getElementById("resultado").innerHTML = "Has vivido " + dias + " días.";
        //document.getElementById("resultado").innerHTML = "Has vivido " + dias/30 + " meses.";

    }else{
        document.getElementById("resultado").innerHTML = "No has ingresado una fecha";
    }
    
}

