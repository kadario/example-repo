// ** React Imports
import { useEffect, useState } from 'react'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { excludedItemAction } from 'src/store/index'

// ** MUI Components
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Component Imports
import ExcludedServices from './ExcludedServices'

const satelliteKindText = ['Без', 'Сопутствующие', 'Являются']
const receptionKindText = ['Обычный', 'Заключительный', 'Диспонцерный', 'Первичный', 'Контрольный', 'Повторный']
const ServiceTable = () => {
  const [serviceTableData, setServiceTableData] = useState<any>(null)
  const [editable, setEditable] = useState<boolean>(false)
  const [excludedData, setExcludedData] = useState<any>(null)
  const serviceStoreData = useSelector((state: any) => state.serviceitem)
  const serviceExcludedEditable = useSelector((state: any) => state.excludeditem.editable)

  const dispatcher = useDispatch()

  const handleEditable = () => {
    editable
      ? dispatcher(excludedItemAction.hideExcludedEditable())
      : dispatcher(excludedItemAction.showExcludedEditable())
  }

  useEffect(() => {
    setEditable(serviceExcludedEditable)
  }, [serviceExcludedEditable])

  useEffect(() => {
    if (serviceStoreData.id != null) {
      setServiceTableData(serviceStoreData)
      setExcludedData(serviceStoreData.excluded_service)
    }
  }, [serviceStoreData])

  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography sx={{ fontSize: 18 }}>Наименование</Typography>
            </TableCell>
            <TableCell>{serviceTableData?.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Доступность</TableCell>
            <TableCell>{serviceTableData?.is_available ? 'Да' : 'Нет'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Сопутсвующие</TableCell>
            <TableCell>{satelliteKindText[serviceTableData?.satellite_kind]}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Вид приема</TableCell>
            <TableCell>{receptionKindText[serviceTableData?.reception_kind]}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Детская услуга</TableCell>
            <TableCell>{serviceTableData?.children_type ? 'Да' : 'Нет'}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Не входит в мотивацию</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 4 }}>
                  <Fab aria-label='edit' size='small' onClick={handleEditable}>
                    {editable ? <Icon icon='mdi:close' /> : <Icon icon='mdi:pencil' />}
                  </Fab>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  {editable ? (
                    <ExcludedServices />
                  ) : (
                    <>
                      {excludedData ? 'Да' : 'Нет'}
                      &nbsp;
                      <Typography color='text.secondary' sx={{ ml: 2, fontStyle: 'italic' }}>
                        {excludedData?.comment}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ServiceTable
