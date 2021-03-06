import React from 'react';
import './userTable.css';
import API from '../api/API';
import moment from 'moment'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { TextRow } from 'react-placeholder/lib/placeholders';


class RentalHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rentals: [],
            selectedRental: '',
            deletionPopUp: false
        }
    }

    componentDidMount() {
        this.loadRentals();
    }

    loadRentals() {
        this.setState({ rentals: 'loading' })
        API.getRentals(true)
            .then((rentals) => { this.setState({ rentals: rentals, selectedRental: '' }) })
            .catch((err) => {this.props.handleAuthFailure(err)});
    }

    deleteRental = () => {
        API.deleteRental(this.state.selectedRental)
            .then(() => {
                this.setDeletionPopUp();
                this.loadRentals();
                this.setState({ selectedRental: '' })
            }).catch((err) => {this.props.handleAuthFailure(err)});
    }

    setDeletionPopUp = (selectedRental) => {
        var tempDel = this.state.deletionPopUp;
        this.setState({ selectedRental: selectedRental, deletionPopUp: !tempDel });
    }

    render() {
        return (
            <div className="d-flex justify-content-between">
                <DeletionPopUp show={this.state.deletionPopUp} deleteRental={this.deleteRental} setDeletionPopUp={this.setDeletionPopUp} />
                <RentalsTable past={true}
                    rentals={this.state.rentals === 'loading' ? this.state.rentals : this.state.rentals.filter((r) => moment(r.endDate).isBefore(moment()))}
                    colors={this.props.colors} />
                <RentalsTable past={false}
                    rentals={this.state.rentals === 'loading' ? this.state.rentals : this.state.rentals.filter((r) => moment(r.endDate).isAfter(moment()))}
                    colors={this.props.colors}
                    setDeletionPopUp={this.setDeletionPopUp} />
            </div>
        )
    }

}

const FutureRentalRow = (props) => {
    return (<>
        <OverlayTrigger
            key={props.rental.carBrand + props.rental.carModel + props.rental.userId + props.rental.startDate + props.rental.endDate}
            placement="left"
            transition={null}
            overlay={
                <Tooltip >
                    Click to delete.
                </Tooltip>
            }
        >
            <tr onClick={!props.past && (() => props.setDeletionPopUp(props.rental))}>
                <td>
                    <span className={"badge badge-" + props.colors[props.rental.carBrand]}>
                        {props.rental.carBrand + " " + props.rental.carModel}
                    </span>
                </td>
                <td>
                    {props.rental.startDate}
                </td>
                <td>
                    {props.rental.endDate}
                </td>
                <td>
                    {props.rental.price}
                </td>
            </tr>
        </OverlayTrigger>
    </>)
}

const PastRentalRow = (props) => {
    return (<>
        <tr>
            <td>
                <span className={"badge badge-" + props.colors[props.rental.carBrand]}>
                    {props.rental.carBrand + " " + props.rental.carModel}
                </span>
            </td>
            <td>
                {props.rental.startDate}
            </td>
            <td>
                {props.rental.endDate}
            </td>
            <td>
                {props.rental.price}
            </td>
        </tr>
    </>)
}

const SingleFakeRow = () => {
    return (<>
        <tr>
            <td>
                <TextRow color="#666666" />
            </td>
            <td>
                <TextRow color="#666666" />
            </td>
            <td>
                <TextRow color="#666666" />
            </td>
            <td>
                <TextRow color="#666666" />
            </td>
        </tr>
    </>)
}

const FakeRows = () => {
    return (<>
        <SingleFakeRow />
        <SingleFakeRow />
        <SingleFakeRow />
        <SingleFakeRow />
        <SingleFakeRow />
    </>)
}

const RentalsTable = (props) => {
    return (<div className="my-5 mx-auto col-6">
        <div className={props.past ? "badge badge-primary" : "badge badge-success"}>
            {props.rentals !== "loading" && props.rentals.length === 0 ? <h4>No rental available in this section</h4> : <h4>
                {props.past ? "Your previous rentals:" : "Your future rentals:"}
            </h4>}
        </div>
        {(props.rentals !== "loading" && props.rentals.length === 0) || <div className="scrollRentalsTable">
            <table className="table table-hover table-dark text-center" id="carTable">
                <thead>
                    <tr>
                        <th>
                            Reserved Car
                        </th>
                        <th>
                            First day of rental
                        </th>
                        <th>
                            Last day of rental
                        </th>
                        <th>
                            Price
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(props.rentals === "loading" && <FakeRows />) || (props.rentals.map((r) => (moment(r.startDate).isAfter(moment())) ?       //not only rentals in the past but also rentals that are and not finished yet
                        <FutureRentalRow key={r.carId + r.startDate + r.endDate}
                            colors={props.colors}
                            rental={r}
                            setDeletionPopUp={props.setDeletionPopUp} /> :
                        <PastRentalRow key={r.carId + r.startDate + r.endDate}
                            colors={props.colors}
                            rental={r} />))}
                </tbody>
            </table>
        </div>}
    </div>)
}

const DeletionPopUp = (props) => {
    return <Modal show={props.show} onHide={props.setDeletionPopUp} className="my-5" animation={false}>

        <Modal.Body>
            <h4>Do you really want to delete this future rental?</h4>
        </Modal.Body>

        <Modal.Footer>
            <Button className="btn btn-danger" onClick={(ev) => { props.deleteRental(props.rental) }}>Yes</Button>
            <Button className="btn btn-primary" onClick={(ev) => { props.setDeletionPopUp() }}>No</Button>
        </Modal.Footer>
    </Modal>
}


export default RentalHistory;

