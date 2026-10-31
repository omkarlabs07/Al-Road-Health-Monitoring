import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/workers.css";

import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserCog,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaSearch,
  FaClipboardCheck,
  FaFilter,
  FaTasks,
} from "react-icons/fa";

export default function Workers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [workers, setWorkers] = useState([
    {
      id: 1,
      name: "Rahul Patil",
      phone: "9876543210",
      area: "Powai",
      road: "Main Road",
      task: "Pothole Repair",
      status: "Assigned",
    },
    {
      id: 2,
      name: "Amit Sharma",
      phone: "9876543211",
      area: "Andheri",
      road: "Link Road",
      task: "Road Inspection",
      status: "Available",
    },
    {
      id: 3,
      name: "Vikas More",
      phone: "9876543212",
      area: "Ghatkopar",
      road: "Station Road",
      task: "Pothole Repair",
      status: "Busy",
    },
    {
      id: 4,
      name: "Sagar Jadhav",
      phone: "9876543213",
      area: "Vikhroli",
      road: "Park Road",
      task: "Road Inspection",
      status: "Available",
    },
    {
      id: 5,
      name: "Akash Shinde",
      phone: "9876543214",
      area: "Bhandup",
      road: "Market Road",
      task: "Pothole Repair",
      status: "Assigned",
    },
  ]);

  /* =========================
     STATUS UPDATE
  ========================= */

  const updateStatus = (id, newStatus) => {
    setWorkers((currentWorkers) =>
      currentWorkers.map((worker) =>
        worker.id === id
          ? { ...worker, status: newStatus }
          : worker
      )
    );
  };

  /* =========================
     SEARCH + FILTER
  ========================= */

  const filteredWorkers = workers.filter((worker) => {
    const searchText = `
      ${worker.name}
      ${worker.area}
      ${worker.road}
      ${worker.task}
      ${worker.status}
    `.toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      statusFilter === "All" ||
      worker.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* =========================
     STATS
  ========================= */

  const totalWorkers = workers.length;

  const availableWorkers = workers.filter(
    (worker) => worker.status === "Available"
  ).length;

  const assignedWorkers = workers.filter(
    (worker) => worker.status === "Assigned"
  ).length;

  const busyWorkers = workers.filter(
    (worker) => worker.status === "Busy"
  ).length;

  return (
    <DashboardLayout>
      <div className="workers-page">

        {/* ================= HEADER ================= */}

        <div className="workers-header">

          <div>
            <div className="workers-title-row">
              <div className="workers-title-icon">
                <FaUsers />
              </div>

              <div>
                <h1>Workers</h1>

                <p>
                  Manage road maintenance workers and assignments
                </p>
              </div>
            </div>
          </div>

          <div className="workers-header-badge">
            <FaClipboardCheck />
            <span>Maintenance Team</span>
          </div>

        </div>

        {/* ================= STATS ================= */}

        <div className="workers-stats">

          <div className="worker-stat blue">
            <div className="worker-stat-icon">
              <FaUsers />
            </div>

            <div>
              <span>Total Workers</span>
              <h2>{totalWorkers}</h2>
            </div>
          </div>

          <div className="worker-stat green">
            <div className="worker-stat-icon">
              <FaUserCheck />
            </div>

            <div>
              <span>Available</span>
              <h2>{availableWorkers}</h2>
            </div>
          </div>

          <div className="worker-stat orange">
            <div className="worker-stat-icon">
              <FaUserClock />
            </div>

            <div>
              <span>Assigned</span>
              <h2>{assignedWorkers}</h2>
            </div>
          </div>

          <div className="worker-stat red">
            <div className="worker-stat-icon">
              <FaUserCog />
            </div>

            <div>
              <span>Busy</span>
              <h2>{busyWorkers}</h2>
            </div>
          </div>

        </div>

        {/* ================= MANAGEMENT CARD ================= */}

        <div className="workers-card">

          <div className="workers-card-header">

            <div>
              <div className="workers-section-title">
                <FaTasks />
                <h2>Worker Management</h2>
              </div>

              <p>
                View, search and manage road maintenance workers
              </p>
            </div>

            <div className="workers-controls">

              {/* SEARCH */}

              <div className="worker-search">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search workers..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              {/* STATUS FILTER */}

              <div className="worker-filter">

                <FaFilter />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Busy">Busy</option>
                </select>

              </div>

            </div>

          </div>

          {/* ================= TABLE ================= */}

          <div className="workers-table-wrapper">

            <table className="workers-table">

              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Contact</th>
                  <th>Area</th>
                  <th>Assigned Road</th>
                  <th>Task</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredWorkers.length > 0 ? (

                  filteredWorkers.map((worker) => (

                    <tr key={worker.id}>

                      {/* WORKER */}

                      <td>

                        <div className="worker-profile">

                          <div className="worker-avatar">
                            {worker.name.charAt(0)}
                          </div>

                          <div>
                            <strong>
                              {worker.name}
                            </strong>

                            <small>
                              Worker #{worker.id}
                            </small>
                          </div>

                        </div>

                      </td>

                      {/* PHONE */}

                      <td>

                        <div className="worker-contact">

                          <FaPhone />

                          <span>
                            {worker.phone}
                          </span>

                        </div>

                      </td>

                      {/* AREA */}

                      <td>

                        <div className="worker-area">

                          <FaMapMarkerAlt />

                          <span>
                            {worker.area}
                          </span>

                        </div>

                      </td>

                      {/* ROAD */}

                      <td>

                        <strong className="road-name">
                          {worker.road}
                        </strong>

                      </td>

                      {/* TASK */}

                      <td>

                        <div className="worker-task">

                          <FaTools />

                          <span>
                            {worker.task}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <div className="worker-status-wrapper">

                          <span
                            className={`worker-status ${worker.status.toLowerCase()}`}
                          >
                            <span className="status-dot"></span>
                            {worker.status}
                          </span>

                          <select
                            className="status-select"
                            value={worker.status}
                            onChange={(e) =>
                              updateStatus(
                                worker.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="Available">
                              Available
                            </option>

                            <option value="Assigned">
                              Assigned
                            </option>

                            <option value="Busy">
                              Busy
                            </option>
                          </select>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="no-workers"
                    >

                      <FaUsers />

                      <strong>
                        No workers found
                      </strong>

                      <span>
                        Try changing your search or filter.
                      </span>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}

          <div className="workers-table-footer">

            <span>
              Showing{" "}
              <strong>
                {filteredWorkers.length}
              </strong>{" "}
              of{" "}
              <strong>
                {totalWorkers}
              </strong>{" "}
              workers
            </span>

            <span className="worker-footer-status">
              <span className="status-dot"></span>
              Live team status
            </span>

          </div>

        </div>

        {/* ================= INFO CARDS ================= */}

        <div className="workers-info">

          <div className="workers-info-card">

            <div className="info-icon">
              <FaTools />
            </div>

            <div>
              <strong>
                Road Maintenance
              </strong>

              <span>
                Workers can be assigned to pothole
                repair and road inspection tasks.
              </span>
            </div>

          </div>

          <div className="workers-info-card">

            <div className="info-icon">
              <FaMapMarkerAlt />
            </div>

            <div>
              <strong>
                Area Based Assignment
              </strong>

              <span>
                Assign workers according to road
                location and maintenance requirements.
              </span>
            </div>

          </div>

          <div className="workers-info-card">

            <div className="info-icon">
              <FaUserCheck />
            </div>

            <div>
              <strong>
                Team Availability
              </strong>

              <span>
                Track available, assigned and busy
                workers from one place.
              </span>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
