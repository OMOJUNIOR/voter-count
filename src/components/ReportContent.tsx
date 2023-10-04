import React from 'react';
import html2canvas from 'html2canvas';
import { Grid, Typography } from '@mui/material';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

import { Candidate, ReportConfig } from '../Types';
import PieChart from './PieChart';

interface ReportContentProps {
  reportConfig: ReportConfig,
  candidates: Candidate[];
  invalidVotes: number;
}

const ReportContent: React.FC<ReportContentProps> = ({
  reportConfig,
  candidates,
  invalidVotes,
}) => {
  const validVotes = candidates.reduce((acc, candidate) => acc + candidate.votes, 0);
  const totalVotes = validVotes + invalidVotes;

  // First chart: candidate votes and invalid votes according to total votes
  const totalVotesData = {
    labels: [...candidates.map(candidate => candidate.name), 'INVALID VOTES'],
    datasets: [{
      data: [...candidates.map(candidate => candidate.votes), invalidVotes],
      backgroundColor: ['#5D9C59','#4477CE', '#777777','#451952', '#FE0000'],
      borderColor: '#fff'
    }],
  };

  // Second chart: candidate votes according to valid votes
  const validVotesData = {
    labels: candidates.map(candidate => candidate.name),
    datasets: [{
      data: candidates.map(candidate => candidate.votes),
      backgroundColor: ['#5D9C59','#4477CE', '#777777','#451952'],
      borderColor: '#fff'
    }],
  };

  return (
    <div id="reportContent" style={{
      padding: 10,
      backgroundColor: 'white',
      display: "none",
      width: 1000,
      height: 1532,
    }}>
      <h2>2023 Liberia Presidential Election Vote Tally</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {reportConfig.centerName && <span><strong>Center Name:</strong> {reportConfig.centerName}</span>}
        {reportConfig.countyName && <span><strong>County Name:</strong> {reportConfig.countyName}</span>}
        {reportConfig.countyCode && <span><strong>County Code:</strong> {reportConfig.countyCode}</span>}
        {reportConfig.districtNo && <span><strong>District Number:</strong> {reportConfig.districtNo}</span>}
        {reportConfig.districtCode && <span><strong>District Code:</strong> {reportConfig.districtCode}</span>}
        {reportConfig.votingCenterNumber && <span><strong>Voting Center Name:</strong> {reportConfig.votingCenterNumber}</span>}
        {reportConfig.votingPrecincts && <span><strong>Voting Precints Number:</strong> {reportConfig.votingPrecincts}</span>}
        {reportConfig.boxNo && <span><strong>Ballot Box Number:</strong> {reportConfig.boxNo}</span>}

      </div>
      <div>
        <Grid container spacing={3}>
          {candidates.map((candidate, index) => (
            <Grid item xs={6} key={index}>
              <div style={{
                paddingRight: (index !== candidates.length - 1) ? 40 : undefined,
                borderRight: (index !== candidates.length - 1) ? '2px solid black' : undefined,
                minWidth: 130,
              }}>
                <img alt={candidate.name} src={candidate.image} width={100} />
                <Typography style={{
                  fontWeight: 700
                }}>
                  {candidate.name}
                </Typography>
                <Typography style={{
                  fontSize: 60,
                  fontWeight: 700,
                }}>
                  {candidate.votes}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} style={{
          paddingTop: 10,
          borderTop: '2px solid black',
          width: '100%',
          marginTop: 10,
        }}>
          <Grid item xs={4}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <Typography variant="h6" style={{
                fontWeight: 700,
              }}>
                TOTAL VOTES
              </Typography>
              <Typography style={{
                fontSize: 48,
                fontWeight: 700,
              }}>
                {totalVotes.toString()}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={4}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <Typography variant="h6" style={{
                fontWeight: 700,
              }}>
                VALID VOTES
              </Typography>
              <Typography style={{
                fontSize: 48,
                fontWeight: 700,
              }}>
                {validVotes.toString()}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={4}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
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
                {invalidVotes.toString()}
              </Typography>
            </div>
          </Grid>
        </Grid>

        <Grid container spacing={3} style={{
          paddingTop: 10,
          borderTop: '2px solid black',
          width: '100%',
          marginTop: 20,
        }}>
          <Grid item xs={6} style={{
            paddingRight: 40,
            borderRight: '2px solid black',
            minWidth: 130,
          }}>
            <Typography variant="h6" style={{
              fontWeight: 700,
            }}>
              TOTAL VOTES
            </Typography>
            <center>
              <PieChart data={totalVotesData} />
            </center>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" style={{
              fontWeight: 700,
            }}>
              VALID VOTES
            </Typography>
            <center>
              <PieChart data={validVotesData} />
            </center>
          </Grid>
        </Grid>
      </div>

      <div style={{ marginTop: 40, marginBottom: 40, textAlign: 'left' }}>
        <span style={{ fontWeight: 600, color: 'red'}}>This is not an official document, and inputs are not recorded. It has been developed as open-source to facilitate  quick verification by all observers during the vote counting process, regardless of party affiliation</span>
        <br />
        <br />
        <span style={{ fontWeight: 600 }}>
          <a href="https://libvotetally.com" target="_blank" rel="noreferrer" style={{ color: 'blue' }}>libvotetally.com</a>
        </span>
      </div>

    </div>
  )
}

export const generateReport = (reportConfig: ReportConfig): Promise<string> => {
  const reportContent = document.getElementById('reportContent');

  if (reportContent) {
    reportContent.style.display = 'block';

    return new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        html2canvas(reportContent).then(canvas => {
          let pdf;
          if (reportConfig.format === 'PNG') {
            const imgData = canvas.toDataURL("image/png");
            saveAs(imgData, `tallyReport_${new Date().getTime()}.png`);
            reportContent.style.display = 'none';
            resolve(imgData);
          } else {
            pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`tallyReport_${new Date().getTime()}.pdf`);
            reportContent.style.display = 'none';
            resolve(imgData);
          }
        }).catch(error => {
          reject(error);
        });
      }, 2000);
    });
  } else {
    return Promise.reject(new Error('Report content element not found.'));
  }
};



export default ReportContent;
