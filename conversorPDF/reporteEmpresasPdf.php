<?php

include_once 'pdf/fpdf.php';
include_once 'util.php';

class PDF extends FPDF
{
	var $terminal;

	function setTerminal($unaTerminal){
		$this->terminal = $unaTerminal;
	}

	function Header()
	{
		//Logo
		$this->Image('imagenes/logo.jpg',10,8,40);
		//Arial bold 15
		$this->SetFont('Arial','B',16);
		//Movernos a la derecha

		//Título
		$this->SetX(50);
		$this->Cell(110,10,utf8_decode('Sistema de Control de Terminales'),0,0,'C');
		$this->Ln();
		$this->SetX(50);
		$this->Cell(110,10,utf8_decode('Reporte de Facturación a Empresas'),0,0,'C');

		//Salto de línea
		$this->Ln(15);
	}

	function Footer()
	{
		//Posición: a 1,5 cm del final
		$this->SetY(-15);
		$y = $this->GetY();
		$this->Line(10, $y, 200, $y);
		//Arial italic 8
		$this->SetFont('Arial','I',8);
		//Número de página
		$this->Cell(20,10,utf8_decode('Página ').$this->PageNo().'/{nb}',0,0,'L');
		$this->Cell(165, 10, utf8_decode("Administración General de Puertos S.E. - Departamento de Desarrollo"), 0, 0, "R");
		$this->Image("imagenes/logo_puertochico.jpg", $this->GetX(), $this->GetY() + 2, 5);
	}

	function CheckPageBreak($h)
	{
		//If the height h would cause an overflow, add a new page immediately
		if($this->GetY()+$h>$this->PageBreakTrigger)
			$this->AddPage($this->CurOrientation);
	}
}

$data = get_post();
$id = $data['id'];
$desde = date('d/m/Y', strtotime($data['desde']));
$hasta = date('d/m/Y', strtotime($data['hasta']));
$hoy = date('d/m/Y', strtotime($data['hoy']));

crear_archivos_graficos($data['charts'], $id);

$pdf = new PDF();
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(190, 8, utf8_decode('Reporte generado el ' . $hoy), 0, "L");
$pdf->Ln();
$pdf->Cell(190, 8, utf8_decode('Período controlado: Del ' . $desde . ' hasta el ' . $hasta), 0, "L");
$pdf->Ln(10);

$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(75, 5, utf8_decode('Razón Social'), 1, 0);
$pdf->Cell(27, 5, 'Comprobantes', 1, 0, "R");
$pdf->Cell(23, 5, 'Porcentaje', 1, 0, "R");
$pdf->Cell(32, 5, 'Promedio', 1, 0, "R");
$pdf->Cell(33, 5, 'Total', 1, 0, "R");
$pdf->Ln();

$pdf->SetFont('Arial', '', 8);
foreach ($data['resultados'] as $resultado) {
	$porcentaje = $resultado['total'] * 100 / $data['totalTerminal'];
	$pdf->Cell(75, 5, utf8_decode($resultado['razon']), 1, 0);
	$pdf->Cell(27, 5, $resultado['cnt'], 1, 0, "R");
	$pdf->Cell(23, 5, number_format($porcentaje, 2) . " %", 1, 0, "R");
	$pdf->Cell(32, 5, "$ " . number_format($resultado['avg'], 2), 1, 0, "R");
	$pdf->Cell(33, 5, "S " . number_format($resultado['total'], 2), 1, 0, "R");
	$pdf->Ln();
}

$h = getChartHeigth($data['charts'][0], 120);
$pdf->CheckPageBreak($h);

$pdf->Image(".temp/1" . $id . ".jpg", $pdf->GetX(), $pdf->GetY() + 2, 120);
$pdf->Image(".temp/2" . $id . ".jpg", 100, $pdf->GetY() + 8, 120);

borrar_archivos_graficos($data['charts'], $id);

$pdf->Output();
