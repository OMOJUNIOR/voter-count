import { FC, useState, useEffect, ChangeEvent } from 'react';
import {
Button,
Container,
Typography,
Grid,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
TextField,
FormControl,
FormLabel,
RadioGroup,
FormControlLabel,
Radio,
CircularProgress,
IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import GeorgeImage from './assets/images/gerogem.png';
import JosephImage from './assets/images/josephbk.png';
import LusineImage from './assets/images/lusinekm.png';
import AlexanderImage from './assets/images/alexandercm.png';
import {
Candidate,
PastVotes,
ReportConfig,
} from './Types';
import ReportContent, { generateReport } from './components/ReportContent';

const ACTION_DELAY = 300;

const candidateColors = "grey";

const candidateData: Candidate[] = [
{ name: "JOSEPH Y BOAKAI", image: JosephImage, votes: 0, party:"#2" },
{ name: "ALEXANDER CUMMINGS", image: AlexanderImage, votes: 0, party: "#4" },
{ name: "LUSINE F KAMARA", image: LusineImage, votes: 0, party: "#7" },
{ name: "GEORGE M WEAH", image: GeorgeImage, votes: 0, party: "#18" }, // Candidate name and image
];

const App: FC = () => {
const [candidates, setCandidates] = useState(candidateData);
const [invalidVotes, setInvalidVotes] = useState(0);
const [openConfirmation, setOpenConfirmation] = useState(false);
const [actionType, setActionType] = useState<'reset' | 'clear' | null>(null);
  const [pastVotes, setPastVotes] = useState<PastVotes[]>([]);
    const [logOpen, setLogOpen] = useState(false);
    const [reportConfigOpen, setReportConfigOpen] = useState(false);
    const [reportConfig, setReportConfig] = useState<ReportConfig>({
      centerName: '',
      countyName: '',
      countyCode: '',
      districtNo: '',
      districtCode: '',
      votingCenterNumber: '',
      votingPrecincts: '',
      boxNo: '',
      format: 'PNG',
      });
      const [actionAvailable, setActionAvailable] = useState(true);
      const [downloading, setDownloading] = useState(false);
      const [report, setReport] = useState('');

      useEffect(() => {
      const savedVotes = localStorage.getItem("votes");
      const savedInvalidVotes = localStorage.getItem("invalidVotes");
      const savedPastVotes = localStorage.getItem("pastVotes");

      if (savedVotes) {
      const votes = JSON.parse(savedVotes);
      setCandidates(candidateData.map((candidate, index) => ({ ...candidate, votes: votes[index] })));
      }
      if (savedInvalidVotes) {
      setInvalidVotes(Number(savedInvalidVotes));
      }
      if (savedPastVotes) {
      setPastVotes(JSON.parse(savedPastVotes));
      }
      }, []);

      const checkActionAvailable = () => {
      if (actionAvailable) {
      setActionAvailable(false);
      setTimeout(() => {
      setActionAvailable(true);
      }, ACTION_DELAY);
      }
      }

      const handleVote = (index: number) => {
      checkActionAvailable();

      if (!actionAvailable) {
      return null;
      }

      const newCandidates = [...candidates];
      newCandidates[index].votes++;
      setCandidates(newCandidates);
      localStorage.setItem("votes", JSON.stringify(newCandidates.map(candidate => candidate.votes)));
      };

      const handleRemoveVote = (index: number) => {
      checkActionAvailable();

      if (!actionAvailable) {
      return null;
      }

      const newCandidates = [...candidates];
      if (newCandidates[index].votes > 0) {
      newCandidates[index].votes--;
      setCandidates(newCandidates);
      localStorage.setItem("votes", JSON.stringify(newCandidates.map(candidate => candidate.votes)));
      }
      };

      const handleInvalidVote = () => {
      setInvalidVotes(prevInvalidVotes => prevInvalidVotes + 1);
      localStorage.setItem("invalidVotes", String(invalidVotes + 1));
      };

      const handleRemoveInvalidVote = () => {
      if (invalidVotes > 0) {
      setInvalidVotes(prevInvalidVotes => prevInvalidVotes - 1);
      localStorage.setItem("invalidVotes", String(invalidVotes - 1));
      }
      };

      const handleReset = () => {
      const validVotes = candidates.reduce((acc, candidate) => acc + candidate.votes, 0);
      const totalVotes = validVotes + invalidVotes;

      const newPastVotes = { timestamp: Date.now(), votes: [...candidates], invalidVotes, validVotes, totalVotes };
      setPastVotes(prevPastVotes => {
      const updatedPastVotes = [newPastVotes, ...prevPastVotes];
      localStorage.setItem("pastVotes", JSON.stringify(updatedPastVotes)); // Storing in local storage
      return updatedPastVotes;
      });

      const resetCandidates = candidates.map(candidate => ({ ...candidate, votes: 0 }));
      setCandidates(resetCandidates);
      setInvalidVotes(0);

      localStorage.removeItem("votes");
      localStorage.removeItem("invalidVotes");
      };

      const handleClearPastVotes = () => {
      setPastVotes([]);
      localStorage.removeItem('pastVotes');
      };

      const handleResetClick = () => {
      setActionType('reset');
      setOpenConfirmation(true);
      }

      const handleClearPastVotesClick = () => {
      setActionType('clear');
      setOpenConfirmation(true);
      }

      const handleConfirmationClose = (confirmed: boolean) => {
      setOpenConfirmation(false);
      if (confirmed) {
      if (actionType === 'reset') {
      handleReset();
      } else if (actionType === 'clear') {
      handleClearPastVotes();
      }
      }
      setActionType(null);
      };

      const handleInputChange = (prop: keyof ReportConfig) => (event: ChangeEvent<HTMLInputElement |
        HTMLTextAreaElement>) => {
        setReportConfig({ ...reportConfig, [prop]: event.target.value });
        };

        const handleGenerateReport = async () => {
        setDownloading(true);
        try {
        const image = await generateReport(reportConfig);
        setReport(image);
        } catch (error) {
        console.error(error);
        } finally {
        setDownloading(false);
        }
        }

        const handleClose = () => {
        setReportConfigOpen(false)
        setReport('')
        };

        return (
        <Container style={{
      maxWidth: 600,
      padding: 20,
      textAlign: 'center',
    }}>
          <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
      }}>
            <Typography variant="h6" style={{
          fontWeight: 700,
          fontSize: 24,
          textAlign: 'left',
        }}>
              Liberia Presidential Election Vote Tally 2023
            </Typography>
            <Button variant="contained" color="error" onClick={handleResetClick}>
              Reset
            </Button>
          </div>

          <Dialog open={openConfirmation} onClose={()=> handleConfirmationClose(false)} maxWidth="xs" fullWidth>
            <DialogTitle style={{ fontWeight: 900 }}>Confirm</DialogTitle>
            <DialogContent>
              <Typography>Are you sure? This action is irreversible</Typography>
            </DialogContent>
            <DialogActions>
              <Button style={{ color: 'red' }} onClick={()=> handleConfirmationClose(false)}>Cancel</Button>
              <Button onClick={()=> handleConfirmationClose(true)} autoFocus
                style={{ fontWeight: 700, color: 'green' }}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Grid item xs={12}>
            <div style={{
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 10,
          borderTop: '2px solid black',
          marginBottom: -10,
        }}>
              <Typography variant="h6" style={{
            fontWeight: 700,
            marginBottom: -10,
          }}>
                TOTAL VOTES
              </Typography>
              <Typography style={{
            fontSize: 48,
            fontWeight: 700,
          }}>
                {invalidVotes + candidates.reduce((acc, candidate) => acc + candidate.votes, 0)}
              </Typography>
              <div style={{
            display: 'flex',
            gap: 10,
          }}>
              </div>
            </div>
          </Grid>

          <Grid container spacing={8}>
            {candidates.map((candidate, index) => (
            <Grid item xs={6} key={index}>
              <div style={{
              paddingRight: (index !== candidates.length - 1) ? 40 : undefined,
              borderRight: (index !== candidates.length - 1) ? '2px solid black' : undefined,
              minWidth: 135,
            }}>

                {candidate.party}

                <Typography style={{
                fontSize: 20,
                fontWeight: 700,
                
              }}>

                </Typography>
                <img alt={candidate.name} src={candidate.image} width={150} />
                <Typography style={{
                fontWeight: 700,
                fontSize: 18,


              }}>

                  {candidate.name}
                </Typography>
                <Typography style={{
                fontSize: 50,
                fontWeight: 700,
              }}>


                  {candidate.votes}
                </Typography>
                <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
              }}>
                  <Button variant="contained" color="primary" size="large" onClick={()=> handleVote(index)}
                    style={{
                    fontWeight: 900,
                    padding: '8px 10px',
                    fontSize: 20,
                    marginBottom: 20,
                    backgroundColor: '#4caf50',
                    width: 120,
                  }}>
                    Add Vote
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={()=> handleRemoveVote(index)}
                    style={{
                    padding: '5px',
                  }}>
                    Withdraw Vote
                  </Button>
                </div>
              </div>
            </Grid>
            ))}
            <Grid item xs={12}>
              <div style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 10,
            borderTop: '2px solid black',
          }}>
                <Typography variant="h6" style={{
              fontWeight: 700,
            }}>
                  INVALID VOTES
                </Typography>
                <Typography style={{
              fontSize: 48,
              fontWeight: 700,
            }}>
                  {invalidVotes}
                </Typography>
                <div style={{
              display: 'flex',
              gap: 10,
            }}>
                  <Button variant="contained" color="primary" size="large" onClick={handleInvalidVote} style={{
                    backgroundColor: '#4caf50', 
                }}>
                    Add Vote
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={handleRemoveInvalidVote}>
                    Withdraw Vote
                  </Button>
                </div>
              </div>
            </Grid>
          </Grid>

          {logOpen && (
          <div style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 10,
          borderTop: '2px solid black',
        }}>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}>
              <Typography variant="h6" style={{
              fontWeight: 700,
            }}>
                PAST DATA
              </Typography>
              <Button onClick={()=> setLogOpen(false)} style={{ fontWeight: 700 }}>close</Button>
            </div>
            <div style={{ marginBottom: 10, textAlign: 'left' }}>
              The latest data during each reset is shown below.
            </div>

            {pastVotes.map((pastVote, index) => (
            <div key={index}
              style={{ borderBottom: '1px solid #ccc', paddingBottom: 10, paddingTop: 10, textAlign: 'left' }}>
              <Typography style={{ fontWeight: 700 }}>{new Date(pastVote.timestamp).toLocaleString('en-GB')}
              </Typography>
              {pastVote.votes.map((candidate, candidateIndex) => (
              <div key={candidateIndex}>
                <Typography style={{ color: candidateColors }}>{candidate.name}: {candidate.votes}</Typography>
              </div>
              ))}
              <br />
              <Typography style={{color: 'green'}}>VALID VOTES: {pastVote.validVotes}</Typography>
              <Typography style={{color: 'red'}}>INVALID VOTES: {pastVote.invalidVotes}</Typography>
              <Typography style={{color: 'blue'}}>TOTAL VOTES: {pastVote.totalVotes}</Typography>
            </div>
            ))}

            {pastVotes.length > 0 ? (
            <div style={{ marginTop: 10 }}>
              <Button variant="contained" color="error" onClick={handleClearPastVotesClick}>
                CLEAR PAST DATA
              </Button>
            </div>
            ) : (
            <Typography style={{ color: '#999' }}>NO PAST RECORD FOUND.</Typography>
            )}
          </div>
          )}

          {!logOpen && (
          <div style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 10,
          borderTop: '2px solid black',
        }}>
            <Button onClick={()=> setLogOpen(true)} style={{ fontWeight: 700, fontSize: 18 }}>
              SHOW PAST DATA ({pastVotes.length})
            </Button>
          </div>
          )}

          <div style={{
        marginTop: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        borderTop: '2px solid black',
      }}>
            <Button style={{ fontWeight: 700, fontSize: 18 }} onClick={()=> setReportConfigOpen(true)}>
              Create Report
            </Button>
          </div>

          <Dialog open={reportConfigOpen} onClose={handleClose} maxWidth="xs" fullWidth>
            {report && (
            <>
              <DialogTitle
                style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Tally Report
                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <center><img src={report} alt='report' width={'80%'} /></center>
            </>
            )}
            {!downloading && !report && (
            <>
              <DialogTitle
                style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                GENERATE TALLY REPORT
                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <TextField label="Center Name" value={reportConfig.centerName}
                  onChange={handleInputChange('centerName')} fullWidth size={'small'} margin="normal" />
                <TextField label="County Name" value={reportConfig.countyName}
                  onChange={handleInputChange('countyName')} fullWidth size={'small'} margin="normal" />
                <TextField label="County Code" value={reportConfig.countyCode}
                  onChange={handleInputChange('countyCode')} fullWidth size={'small'} margin="normal" />

                <TextField label="District Number" value={reportConfig.districtNo}
                  onChange={handleInputChange('districtNo')} fullWidth size={'small'} margin="normal" />
                <TextField label="District Code" value={reportConfig.districtCode}
                  onChange={handleInputChange('districtCode')} fullWidth size={'small'} margin="normal" />
                <TextField label="Voting Center Number" value={reportConfig.votingCenterNumber}
                  onChange={handleInputChange('votingCenterNumber')} fullWidth size={'small'} margin="normal" />
                <TextField label="Precinct Number" value={reportConfig.votingPrecincts} size={'small'}
                  onChange={handleInputChange('votingPrecincts')} fullWidth margin="normal" />

                <TextField label="Ballot Box Number" value={reportConfig.boxNo} size={'small'}
                  onChange={handleInputChange('boxNo')} fullWidth margin="normal" />
                <FormControl component="fieldset" style={{ marginTop: 10 }}>
                  <FormLabel component="legend">Select Report Format</FormLabel>
                  <RadioGroup value={reportConfig.format} onChange={handleInputChange('format')} style={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}>
                    <FormControlLabel value="PNG" control={<Radio />} label="PNG" />
                    <FormControlLabel value="PDF" control={<Radio />} label="PDF" />
                  </RadioGroup>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button style={{color: 'red'}} onClick={handleClose}>CANCEL</Button>
                <Button onClick={handleGenerateReport} autoFocus style={{ fontWeight: 700 }}>
                  Download Report
                </Button>
              </DialogActions>
            </>
            )}
            {downloading && !report && (
            <div
              style={{ padding: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 15 }}>
              <CircularProgress />
              Downloading Report...
            </div>
            )}
          </Dialog>

          <div style={{ marginTop: 40, marginBottom: 40, textAlign: 'left' }}>
            It is not an official document, and inputs are not being recorded. It is a tally tool to facilitate quick
            verification by all observers during the vote counting process, regardless of party affiliation.
            <br />
            <br />
            <a href="https://github.com/OMOJUNIOR/voter-count" target="_blank" rel="noreferrer" style={{
          fontWeight: 700,
          color: 'black'
        }}>Github Repo</a>
          </div>

          <ReportContent reportConfig={reportConfig} candidates={candidates} invalidVotes={invalidVotes} />
        </Container>
        );
        };

        export default App;