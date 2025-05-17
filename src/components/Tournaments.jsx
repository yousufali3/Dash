import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, Award, DoorOpen } from 'lucide-react';
import { AuthContext } from '../../AuthContext.jsx';
import { useContext } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;
import axios from 'axios';

const token = localStorage.getItem('token');
console.log(token, 'token from local storage');

// Mock API functions - replace these with your actual API calls
const api = {
  getTournaments: async () => {
    // Replace with your API call

    const tournaments = await axios.get(
      `${apiUrl}/admin/tournament/get-all-tournaments`
    );
    return tournaments;
    // return [
    //   {
    //     _id: '1',
    //     title: 'Summer Free Fire Championship',
    //     mode: 'squad',
    //     gameType: 'Full Map',
    //     entryFee: 50,
    //     prizePool: 5000,
    //     maxParticipants: 100,
    //     participantsCount: 45,
    //     matchDateTime: new Date('2025-06-01T15:00:00'),
    //     roomId: '',
    //     roomPassword: '',
    //     winners: [],
    //   },
    //   {
    //     _id: '2',
    //     title: 'Weekly Clash Squad Tournament',
    //     mode: 'duo',
    //     gameType: 'Clash Squad',
    //     entryFee: 20,
    //     prizePool: 1000,
    //     maxParticipants: 50,
    //     participantsCount: 30,
    //     matchDateTime: new Date('2025-05-20T18:00:00'),
    //     roomId: 'ABCD123',
    //     roomPassword: 'pass123',
    //     winners: [],
    //   },
    // ];
  },
  createTournament: async (tournament) => {
    console.log('tournament', tournament);

    try {
      const res = await axios.post(
        `${apiUrl}/admin/tournament/create`,
        tournament,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.tournament;
    } catch (error) {
      console.error('Failed to create tournament:', error);
      throw error;
    }
  },
  updateTournament: async (id, tournament) => {
    try {
      const response = await axios.post(
        `${apiUrl}/admin/tournament/edit/${id}`,
        tournament
      );
      return response.data.tournament; // Or response.data depending on backend
    } catch (error) {
      console.error('Failed to update tournament:', error);
      throw error;
    }
  },
  deleteTournament: async (id) => {
    try {
      const response = await axios.post(
        `${apiUrl}/admin/tournament/delete/${id}`
      );
      return response.data; // Or response.data depending on backend
    } catch (error) {
      console.error('Failed to delete tournament:', error);
      throw error;
    }
    return true;
  },
};

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTournaments();
      setTournaments(data.data.tournaments);
      console.log(data, 'tournaments');
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTournament = async (tournament) => {
    try {
      const newTournament = await api.createTournament(tournament);
      setTournaments([...tournaments, newTournament]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const handleUpdateTournament = async (tournament) => {
    try {
      const updatedTournament = await api.updateTournament(
        tournament._id,
        tournament
      );
      setTournaments(
        tournaments.map((t) =>
          t._id === tournament._id ? updatedTournament : t
        )
      );
      setEditingTournament(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating tournament:', error);
    }
  };

  const handleDeleteTournament = async (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await api.deleteTournament(id);
        setTournaments(tournaments.filter((t) => t._id !== id));
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  };

  const handleRoomDetailsSave = () => {
    // try {
    //   axios.put(
    //     `${apiUrl}/admin/tournament/room-details/${selectedTournament._id}`,
    //     {
    //       roomId,
    //       roomPassword,
    //     }
    //   );

    //   alert('Room details updated successfully!');
    // } catch (error) {
    //   console.error('Error updating room details:', error);
    //   alert('Failed to update . Please try again.');

    // }

    setShowRoomModal(false);
  };

  const openEditForm = (tournament) => {
    setEditingTournament(tournament);
    setShowForm(true);
  };

  const openRoomDetailsModal = (tournament) => {
    setSelectedTournament(tournament);
    setShowRoomModal(true);
  };

  const openWinnersModal = (tournament) => {
    setSelectedTournament(tournament);
    setShowWinnersModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Parses local datetime
    const options = {
      month: 'short', // May
      day: 'numeric', // 16
      hour: 'numeric', // 2
      minute: '2-digit', // 30
      hour12: true, // PM
    };

    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tournament Admin Dashboard</h1>
            <button
              onClick={() => {
                setEditingTournament(null);
                setShowForm(true);
              }}
              className="bg-white text-blue-500 px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-50"
            >
              <PlusCircle size={20} />
              <span>New Tournament</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">Loading tournaments...</div>
        ) : (
          <>
            {showForm ? (
              <TournamentForm
                tournament={editingTournament}
                onSubmit={
                  editingTournament
                    ? handleUpdateTournament
                    : handleCreateTournament
                }
                onCancel={() => {
                  setShowForm(false);
                  setEditingTournament(null);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Game Info
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entry & Prize
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tournaments.map((tournament) => (
                      <tr key={tournament._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">{tournament.title}</td>
                        <td className="py-4 px-4">
                          <span className="capitalize">{tournament.mode}</span>{' '}
                          - {tournament.gameType}
                        </td>
                        <td className="py-4 px-4">
                          {formatDate(tournament.matchDateTime)}
                        </td>
                        <td className="py-4 px-4">
                          {tournament.entryFee} / {tournament.prizePool}
                        </td>
                        <td className="py-4 px-4">
                          {tournament.participantsCount} /{' '}
                          {tournament.maxParticipants}
                        </td>
                        <td className="py-4 px-4 flex space-x-2">
                          <button
                            onClick={() => openEditForm(tournament)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit Tournament"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openRoomDetailsModal(tournament)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Room Details"
                          >
                            <DoorOpen size={18} />
                          </button>
                          <button
                            onClick={() => openWinnersModal(tournament)}
                            className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                            title="Manage Winners"
                          >
                            <Award size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTournament(tournament._id)
                            }
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete Tournament"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {showRoomModal && (
        <RoomDetailsModal
          tournament={selectedTournament}
          onClose={() => setShowRoomModal(false)}
          onSave={handleRoomDetailsSave}
        />
      )}

      {showWinnersModal && (
        <WinnersModal
          tournament={selectedTournament}
          onClose={() => setShowWinnersModal(false)}
          onSave={(winners) => {
            // Here you would update the tournament with winners
            const updatedTournament = { ...selectedTournament, winners };
            handleUpdateTournament(updatedTournament);
            setShowWinnersModal(false);
          }}
        />
      )}
    </div>
  );
};

const TournamentForm = ({ tournament, onSubmit, onCancel }) => {
  const initialFormData = tournament || {
    title: '',
    description: '',
    mode: 'squad',
    gameType: 'Full Map',
    map: 'Bermuda',
    entryFee: 0,
    prizePool: 0,
    maxParticipants: 52,
    matchDateTime: new Date().toISOString().slice(0, 16),
    prizeBreakup: {
      type: 'rank',
      rankPrizes: [{ from: 1, to: 1, amount: 0 }],
      perKillAmount: 0,
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [prizeRanks, setPrizeRanks] = useState(
    initialFormData.prizeBreakup?.rankPrizes || [{ from: 1, to: 1, amount: 0 }]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePrizeTypeChange = (e) => {
    setFormData({
      ...formData,
      prizeBreakup: {
        ...formData.prizeBreakup,
        type: e.target.value,
      },
    });
  };

  const handlePerKillChange = (e) => {
    setFormData({
      ...formData,
      prizeBreakup: {
        ...formData.prizeBreakup,
        perKillAmount: parseFloat(e.target.value),
      },
    });
  };

  const handleRankPrizeChange = (index, field, value) => {
    const updatedRanks = [...prizeRanks];
    updatedRanks[index] = {
      ...updatedRanks[index],
      [field]: field === 'amount' ? parseFloat(value) : parseInt(value, 10),
    };
    setPrizeRanks(updatedRanks);
  };

  const addRankPrize = () => {
    const lastRank = prizeRanks[prizeRanks.length - 1];
    const nextFrom = lastRank.to + 1;
    setPrizeRanks([...prizeRanks, { from: nextFrom, to: nextFrom, amount: 0 }]);
  };

  const removeRankPrize = (index) => {
    if (prizeRanks.length > 1) {
      setPrizeRanks(prizeRanks.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine the form data with the prize ranks
    const submissionData = {
      ...formData,
      prizeBreakup: {
        ...formData.prizeBreakup,
        rankPrizes: prizeRanks,
      },
      // Preserve other fields that might not be in the form
      ...(tournament
        ? {
            _id: tournament._id,
            createdBy: tournament.createdBy,
            participantsCount: tournament.participantsCount,
            registeredPlayers: tournament.registeredPlayers,
            registeredTeams: tournament.registeredTeams,
            roomId: tournament.roomId,
            roomPassword: tournament.roomPassword,
            winners: tournament.winners,
          }
        : {}),
    };
    onSubmit(submissionData);
  };

  const formatForDateTimeInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {tournament ? 'Edit Tournament' : 'Create New Tournament'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tournament Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Mode
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Type
            </label>
            <select
              name="gameType"
              value={formData.gameType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Clash Squad">Clash Squad</option>
              <option value="Full Map">Full Map</option>
              <option value="Lone Wolf">Lone Wolf</option>
              <option value="Craft Land">Craft Land</option>
              <option value="Free Match">Free Match</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Map
            </label>
            <select
              name="map"
              value={formData.map}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Bermuda">Bermuda</option>
              <option value="Purgatory">Purgatory</option>
              <option value="Kalahari">Kalahari</option>
              <option value="Bermuda 2.0">Bermuda 2.0</option>
              <option value="Alpine">Alpine</option>
              <option value="Nexterra">Nexterra</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Fee
            </label>
            <input
              type="number"
              name="entryFee"
              value={formData.entryFee}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prize Pool
            </label>
            <input
              type="number"
              name="prizePool"
              value={formData.prizePool}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Match Date & Time
            </label>
            <input
              type="datetime-local"
              name="matchDateTime"
              value={formatForDateTimeInput(formData.matchDateTime)}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Prize Breakup
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prize Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="rank"
                  checked={formData.prizeBreakup?.type === 'rank'}
                  onChange={handlePrizeTypeChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Rank Based</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="per_kill"
                  checked={formData.prizeBreakup?.type === 'per_kill'}
                  onChange={handlePrizeTypeChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Per Kill</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="both"
                  checked={formData.prizeBreakup?.type === 'both'}
                  onChange={handlePrizeTypeChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Both</span>
              </label>
            </div>
          </div>

          {(formData.prizeBreakup?.type === 'rank' ||
            formData.prizeBreakup?.type === 'both') && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Rank Prizes
              </h4>
              {prizeRanks.map((rank, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <div className="w-1/3 flex space-x-2">
                    <input
                      type="number"
                      value={rank.from}
                      onChange={(e) =>
                        handleRankPrizeChange(index, 'from', e.target.value)
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="From"
                    />
                    <input
                      type="number"
                      value={rank.to}
                      onChange={(e) =>
                        handleRankPrizeChange(index, 'to', e.target.value)
                      }
                      min={rank.from}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="To"
                    />
                  </div>
                  <input
                    type="number"
                    value={rank.amount}
                    onChange={(e) =>
                      handleRankPrizeChange(index, 'amount', e.target.value)
                    }
                    min="0"
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    onClick={() => removeRankPrize(index)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRankPrize}
                className="mt-1 text-blue-500 hover:text-blue-700 text-sm flex items-center"
              >
                <PlusCircle size={16} className="mr-1" /> Add Rank Prize
              </button>
            </div>
          )}

          {(formData.prizeBreakup?.type === 'per_kill' ||
            formData.prizeBreakup?.type === 'both') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Kill Amount
              </label>
              <input
                type="number"
                value={formData.prizeBreakup?.perKillAmount || 0}
                onChange={handlePerKillChange}
                min="0"
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {tournament ? 'Update Tournament' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
};

const RoomDetailsModal = ({ tournament, onClose, onSave }) => {
  const [roomId, setRoomId] = useState(tournament.roomId || '');
  const [roomPassword, setRoomPassword] = useState(
    tournament.roomPassword || ''
  );
  const [map, setMap] = useState(tournament.map || '');
  const [matchDateTime, setMatchDateTime] = useState(
    tournament.matchDateTime
      ? new Date(tournament.matchDateTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );

  const handleRoomDetailsSave = (roomId, roomPassword, id) => {
    try {
      const res = axios.put(`${apiUrl}/admin/tournament/room-details/${id}`, {
        roomId,
        roomPassword,
      });

      setRoomId('');
      setRoomPassword('');

      if (res.ok) {
        alert('Room details updated successfully!');
        console.log('Room details updated successfully:', res.data);
      }
    } catch (error) {
      console.error('Error updating room details:', error);
      alert('Failed to update room details. Please try again.');
    }
    // setShowRoomModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Room & Match Details</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Password
          </label>
          <input
            type="text"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleRoomDetailsSave(roomId, roomPassword, tournament._id);
              onSave();
              onClose();
            }}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
};

const WinnersModal = ({ tournament, onClose, onSave }) => {
  const [winners, setWinners] = useState(tournament.winners || []);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get registered participants based on tournament mode
  const registeredParticipants =
    tournament.mode === 'solo'
      ? tournament.registeredPlayers || []
      : tournament.registeredTeams || [];

  console.log(registeredParticipants, 'registered participants');

  const handleUpdateParticipant = (participant, rank, kills, amount) => {
    const updatedWinners = [...winners];
    const existingWinnerIndex = updatedWinners.findIndex(
      (w) => w.id === participant._id
    );

    const winnerData = {
      id: participant._id,
      rank: rank,
      name:
        tournament.mode === 'solo'
          ? participant.username
          : participant.teamName,
      kills: kills,
      prize: amount,
    };

    console.log(winnerData, 'winner data');

    if (existingWinnerIndex !== -1) {
      updatedWinners[existingWinnerIndex] = winnerData;
    } else {
      updatedWinners.push(winnerData);
    }

    setWinners(updatedWinners);
  };

  const getParticipantWinnerData = (participantId) => {
    const data = winners.find((w) => w.id === participantId) || {
      rank: '',
      kills: '',
      prize: '',
    };

    return {
      rank: data.rank || '',
      kills: data.kills || '',
      prize: data.prize || '',
    };
  };

  const handleSubmitUpdate = async () => {
    if (!selectedParticipant) return;

    setIsSubmitting(true);
    try {
      const winnerData = getParticipantWinnerData(selectedParticipant._id);
      console.log(winnerData, 'winner data');

      // Validate and format the data
      const formattedData = {
        tournamentId: tournament._id,
        userId: selectedParticipant.userId,
        kills: winnerData.kills === '' ? 0 : parseInt(winnerData.kills),
        rank: winnerData.rank === '' ? 0 : parseInt(winnerData.rank),
        amountWon: winnerData.prize === '' ? 0 : parseInt(winnerData.prize),
        name:
          tournament.mode === 'solo'
            ? selectedParticipant.username
            : selectedParticipant.teamName,
      };

      console.log('Sending formatted data:', formattedData);

      const response = await axios.post(
        `${apiUrl}/admin/tournament/update-result`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response, 'response data');

      if (response.status === 200) {
        // Update local state with the response data
        const updatedWinners = [...winners];

        setWinners(updatedWinners);
        setSelectedParticipant(null);
      }
    } catch (error) {
      console.error('Error updating winner:', error);
      alert('Failed to update winner details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Manage Winners</h3>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Registered {tournament.mode === 'solo' ? 'Players' : 'Teams'}
          </h4>
          {registeredParticipants.length === 0 ? (
            <p className="text-gray-500 italic">
              No participants registered yet
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tournament.mode === 'solo'
                          ? 'Player Name'
                          : 'Team Name'}
                      </th>
                      <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kills
                      </th>
                      {/* <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prize
                      </th> */}
                      <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registeredParticipants.map((participant) => {
                      console.log(participant, 'participant');

                      const winnerData = getParticipantWinnerData(
                        participant.userId
                      );
                      return (
                        <tr key={participant._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                            {tournament.mode === 'solo'
                              ? participant.username
                              : participant.teamName}
                          </td>
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                            {participant.rank || '-'}
                          </td>
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                            {participant.kills || 0}
                          </td>
                          {/* <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                            {winnerData.prize || 0}
                          </td> */}
                          <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                            <button
                              onClick={() =>
                                setSelectedParticipant(participant)
                              }
                              className="w-full sm:w-auto px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selectedParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
              <h4 className="text-lg font-medium mb-4">
                Update {tournament.mode === 'solo' ? 'Player' : 'Team'} Details
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tournament.mode === 'solo' ? 'Player Name' : 'Team Name'}
                  </label>
                  <input
                    type="text"
                    value={
                      tournament.mode === 'solo'
                        ? selectedParticipant.username
                        : selectedParticipant.teamName
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rank
                  </label>
                  <input
                    type="number"
                    value={
                      getParticipantWinnerData(selectedParticipant._id).rank
                    }
                    onChange={(e) =>
                      handleUpdateParticipant(
                        selectedParticipant,
                        e.target.value,
                        getParticipantWinnerData(selectedParticipant._id).kills,
                        getParticipantWinnerData(selectedParticipant._id).prize
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kills
                  </label>
                  <input
                    type="number"
                    value={
                      getParticipantWinnerData(selectedParticipant._id).kills
                    }
                    onChange={(e) =>
                      handleUpdateParticipant(
                        selectedParticipant,
                        getParticipantWinnerData(selectedParticipant._id).rank,
                        e.target.value,
                        getParticipantWinnerData(selectedParticipant._id).prize
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Amount
                  </label>
                  <input
                    type="number"
                    value={
                      getParticipantWinnerData(selectedParticipant._id).prize
                    }
                    onChange={(e) =>
                      handleUpdateParticipant(
                        selectedParticipant,
                        getParticipantWinnerData(selectedParticipant._id).rank,
                        getParticipantWinnerData(selectedParticipant._id).kills,
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleSubmitUpdate}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(winners)}
            className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Winners
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
