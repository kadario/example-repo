import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const SubmitRemove = (props: any) => {
  const handleConfirm = () => {
    props.handleRemove()
    props.handleClose()
  }

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Удалить структуру?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {"Вы уверены, что хотите удалить данную структуру?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirm} 
            variant='contained'
            color='primary'>
            Удалить
          </Button>
          <Button onClick={props.handleClose} autoFocus>Отменить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SubmitRemove